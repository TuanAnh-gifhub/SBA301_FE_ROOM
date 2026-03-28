package org.rent.room.be.serviceImpl;


import org.rent.room.be.constant.SlotStatus;
import org.rent.room.be.dto.request.slot.SlotExtendCheckRequest;
import org.rent.room.be.dto.request.slot.SlotSwapCheckRequest;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.dto.response.slot.SlotExtendCheckResponse;
import org.rent.room.be.dto.response.slot.SlotResponse;
import org.rent.room.be.dto.response.slot.SlotSwapCheckResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.repository.*;
import org.rent.room.be.service.InvoicePdfService;
import org.rent.room.be.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;


@Service
public class SlotServiceImpl implements SlotService {
    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomCopyRepository roomCopyRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Override
    @Transactional
    public Slot createSlot(Slot slot) {
        slot = slotRepository.save(slot);
        return slot;
    }


    @Override
    public SlotExtendCheckResponse checkExtend(UUID bookingId, UUID slotId,
                                               SlotExtendCheckRequest req) {
        Slot slot = getValidSlot(bookingId, slotId);
        int addedMinutes = toMinutes(req.getAmount(), req.getUnit());

        LocalDateTime newEnd = slot.getEndTime().plusMinutes(addedMinutes);


        UUID roomId = slot.getRoomCopy().getRoom().getRoomId();
        boolean conflict = slotRepository.existsConflictByRoom(
                roomId, slot.getEndTime(), newEnd, slotId
        );


        BigDecimal extraPrice = calcExtraPrice(slot, addedMinutes);

        return SlotExtendCheckResponse.builder()
                .available(!conflict)
                .conflictMessage(conflict ? "Khung giờ này đã có booking khác" : null)
                .slotId(slotId.toString())
                .roomCode(slot.getRoomCopy().getRoomCode())
                .originalEnd(slot.getEndTime())
                .newEnd(newEnd)
                .addedMinutes(addedMinutes)
                .originalPrice(slot.getPrice())
                .extraPrice(extraPrice)
                .hourlyRate(calculateHourlyRate(slot))
                .build();
    }

    @Override
    @Transactional
    public void confirmExtend(UUID bookingId, UUID slotId, SlotExtendCheckRequest req) throws IOException {
        SlotExtendCheckResponse check = checkExtend(bookingId, slotId, req);
        if (!check.isAvailable()) {
            throw new AppException(ErrorCode.SLOT_CONFLICT);
        }

        Slot slot = getValidSlot(bookingId, slotId);
        BigDecimal extraPrice = check.getExtraPrice();
        int addedMinutes = check.getAddedMinutes();


        slot.setEndTime(slot.getEndTime().plusMinutes(addedMinutes));
        slot.setPrice(slot.getPrice().add(extraPrice));
        slotRepository.save(slot);


        Booking booking = slot.getBooking();
        booking.setTotalPrice(booking.getTotalPrice().add(extraPrice));
        recalcBookingTime(booking);
        bookingRepository.save(booking);


        List<SlotResponse> slotResponses = booking.getSlots().stream()
                .filter(s -> s.getSlotStatus() != SlotStatus.CANCELLED)
                .map(s -> {
                    RoomCopy rc = s.getRoomCopy();
                    return SlotResponse.builder()
                            .slotId(s.getSlotId())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .price(s.getPrice())
                            .status(s.getSlotStatus())
                            .roomCopy(RoomCopyResponse.builder()
                                    .roomCopyId(rc.getRoomCopyId())
                                    .roomCode(rc.getRoomCode())
                                    .build())
                            .build();
                }).toList();

        String urlPdfInvoice = invoicePdfService.generateInvoice(booking, slotResponses, null);
        booking.setInvoiceUrl(urlPdfInvoice);
        bookingRepository.save(booking);
    }


    private BigDecimal calcExtraPrice(Slot slot, int addedMinutes) {
        if (slot == null || slot.getPrice() == null) return BigDecimal.ZERO;

        // 1. Tính tổng số phút của slot hiện tại
        long currentDurationMin = Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();

        if (currentDurationMin <= 0) return BigDecimal.ZERO;

        // 2. Tính giá mỗi phút (Giữ độ chính xác 10 chữ số thập phân)
        // Công thức: Đơn giá 1 phút = Tổng giá slot / Tổng phút slot
        BigDecimal pricePerMinute = slot.getPrice().divide(
                BigDecimal.valueOf(currentDurationMin), 10, RoundingMode.HALF_UP
        );

        // 3. Tính tiền thêm = Giá mỗi phút * Số phút thêm
        // Sau đó mới làm tròn về 0 chữ số thập phân (tiền VND)
        return pricePerMinute.multiply(BigDecimal.valueOf(addedMinutes))
                .setScale(0, RoundingMode.HALF_UP);
    }

    private static final BigDecimal MINUTES_IN_HOUR = BigDecimal.valueOf(60);

    private BigDecimal calculateHourlyRate(Slot slot) {
        if (slot == null || slot.getPrice() == null ||
                slot.getStartTime() == null || slot.getEndTime() == null) {
            return BigDecimal.ZERO;
        }
        long durMin = Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();

        if (durMin <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal hours = BigDecimal.valueOf(durMin).divide(MINUTES_IN_HOUR, 4, RoundingMode.HALF_UP);
        return slot.getPrice().divide(hours, 0, RoundingMode.HALF_UP);
    }

    @Override
    public SlotSwapCheckResponse checkSwap(UUID bookingId, UUID slotId, SlotSwapCheckRequest req) {
        Slot slot = getValidSlot(bookingId, slotId);

        if (slot.getRoomCopy() == null || slot.getRoomCopy().getRoom() == null) {
            throw new RuntimeException("Phòng hiện tại không hợp lệ");
        }
        UUID targetRoomId = slot.getRoomCopy().getRoom().getRoomId();
        String targetRoomCode = slot.getRoomCopy().getRoomCode();


        if (req.getNewRoomCode() != null && !req.getNewRoomCode().isBlank()) {

            RoomCopy newRoomCopy = roomCopyRepository.findByRoomCode(req.getNewRoomCode())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã phòng: " + req.getNewRoomCode()));

            targetRoomId = newRoomCopy.getRoom().getRoomId();
            targetRoomCode = newRoomCopy.getRoomCode();
        }

        long originalMinutes = Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
        long newMinutes = Duration.between(req.getNewStartTime(), req.getNewEndTime()).toMinutes();

        if (originalMinutes != newMinutes) {
            return buildResponse(slot, req, targetRoomCode, false,
                    String.format("Thời gian phải bằng %d phút", originalMinutes));
        }
        LocalTime newStart = req.getNewStartTime().toLocalTime();
        LocalTime newEnd = req.getNewEndTime().toLocalTime();

        RentalArea rentalArea = slot.getRoomCopy().getRoom().getRentalArea();

        if (rentalArea.getOpenTime() != null && rentalArea.getCloseTime() != null) {
            if (newStart.isBefore(rentalArea.getOpenTime()) ||
                    newEnd.isAfter(rentalArea.getCloseTime())) {

                return buildResponse(
                        slot,
                        req,
                        targetRoomCode,
                        false,
                        String.format(
                                "Khung giờ phải nằm trong thời gian hoạt động (%s - %s)",
                                rentalArea.getOpenTime(),
                                rentalArea.getCloseTime()
                        )
                );
            }
        }
        boolean conflict = slotRepository.existsConflictByRoom(
                targetRoomId, req.getNewStartTime(), req.getNewEndTime(), slotId
        );

        return buildResponse(slot, req, targetRoomCode, !conflict,
                conflict ? "Phòng " + targetRoomCode + " khung giờ này đã có người đặt rồi!" : null);
    }


    private SlotSwapCheckResponse buildResponse(Slot slot, SlotSwapCheckRequest req, String targetRoomCode, boolean available, String msg) {
        return SlotSwapCheckResponse.builder()
                .available(available)
                .conflictMessage(msg)
                .slotId(slot.getSlotId().toString())
                .roomCode(targetRoomCode)
                .originalStart(slot.getStartTime())
                .originalEnd(slot.getEndTime())
                .newStart(req.getNewStartTime())
                .newEnd(req.getNewEndTime())
                .durationMinutes(Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes())
                .build();
    }

    @Override
    @Transactional
    public void confirmSwap(UUID bookingId, UUID slotId, SlotSwapCheckRequest req) throws IOException {
        SlotSwapCheckResponse check = checkSwap(bookingId, slotId, req);
        if (!check.isAvailable()) {
            throw new AppException(ErrorCode.SLOT_CONFLICT);
        }
        Slot slot = getValidSlot(bookingId, slotId);
        slot.setStartTime(req.getNewStartTime());
        slot.setEndTime(req.getNewEndTime());
        slot.setSlotStatus(SlotStatus.BOOKED);

        if (req.getNewRoomCode() != null && !req.getNewRoomCode().isBlank()) {
            RoomCopy newRoomCopy = roomCopyRepository.findByRoomCode(req.getNewRoomCode())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với mã: " + req.getNewRoomCode()));

            slot.setRoomCopy(newRoomCopy);

            slot.setPrice(newRoomCopy.getRoom().getPrice());
        }

        slotRepository.save(slot);

        Booking booking = slot.getBooking();


        recalcBookingTime(booking);
        bookingRepository.save(booking);
        List<SlotResponse> slotResponses = booking.getSlots().stream()
                .map(s -> {
                    RoomCopy rc = s.getRoomCopy();
                    RoomCopyResponse rcResponse = RoomCopyResponse.builder()
                            .roomCopyId(rc.getRoomCopyId())
                            .roomCode(rc.getRoomCode())
                            .build();
                    return SlotResponse.builder()
                            .slotId(s.getSlotId())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .price(s.getPrice())
                            .status(s.getSlotStatus())
                            .roomCopy(rcResponse)
                            .build();
                })
                .toList();

        String urlPdfInvoice = invoicePdfService.generateInvoice(booking, slotResponses, null);
        booking.setInvoiceUrl(urlPdfInvoice);
        bookingRepository.save(booking);
    }


    private Slot getValidSlot(UUID bookingId, UUID slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        if (!slot.getBooking().getBookingId().equals(bookingId)) {
            throw new AppException(ErrorCode.SLOT_NOT_BELONG_TO_BOOKING);
        }
        if (slot.getSlotStatus() == SlotStatus.CANCELLED) {
            throw new AppException(ErrorCode.SLOT_ALREADY_CANCELLED);
        }
        return slot;
    }

    private int toMinutes(int amount, String unit) {
        return "hour".equalsIgnoreCase(unit) ? amount * 60 : amount;
    }


    private void recalcBookingTime(Booking booking) {
        List<Slot> activeSlots = booking.getSlots().stream()
                .filter(s -> s.getSlotStatus() != SlotStatus.CANCELLED)
                .toList();
        activeSlots.stream()
                .map(Slot::getStartTime).min(Comparator.naturalOrder())
                .ifPresent(booking::setStartTime);
        activeSlots.stream()
                .map(Slot::getEndTime).max(Comparator.naturalOrder())
                .ifPresent(booking::setEndTime);
    }

}
