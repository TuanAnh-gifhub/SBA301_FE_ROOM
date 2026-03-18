package org.rent.room.be.serviceImpl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.RentalAreaStatus;
import org.rent.room.be.constant.RoomCopyStatus;
import org.rent.room.be.dto.internal.CloudinaryUploadResult;
import org.rent.room.be.dto.request.rental_area.CreateRentalAreaRequest;
import org.rent.room.be.dto.request.rental_area.UpdateRentalAreaRequest;
import org.rent.room.be.dto.request.rental_area.UpdateRentalAreaStatusRequest;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.rental_area.RentalAreaImageResponse;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.dto.response.report.ReportResponse;
import org.rent.room.be.dto.response.room.RoomImageResponse;
import org.rent.room.be.dto.response.room.RoomResponse;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.dto.response.slot.SlotResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.repository.*;
import org.rent.room.be.service.CloudinaryService;
import org.rent.room.be.service.RentalAreaService;
import org.rent.room.be.specification.BookingSpecification;
import org.rent.room.be.specification.RentalAreaSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RentalAreaServiceImpl implements RentalAreaService {

    RentalAreaRepository rentalAreaRepository;
    RentalAreaImageRepository rentalAreaImageRepository;
    CityRepository cityRepository;
    UserRepository userRepository;
    CloudinaryService cloudinaryService;
    BookingRepository bookingRepository;
    @Override
    @Transactional
    public RentalAreaResponse createRentalArea(CreateRentalAreaRequest req, List<MultipartFile> images, UUID currentUserId) {

        int count = images == null ? 0 : (int) images.stream().filter(f -> f != null && !f.isEmpty()).count();
        if (count < 1 || count > 5) {
            throw new IllegalArgumentException("RentalArea requires 1 to 5 images");
        }

        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        City city = cityRepository.findById(req.getCityId())
                .orElseThrow(() -> new NoSuchElementException("City not found"));

        RentalArea rentalArea = RentalArea.builder()
                .rentalAreaName(req.getRentalAreaName())
                .address(req.getAddress())
                .contactName(req.getContactName())
                .contactPhone(req.getContactPhone())
                .status(req.getStatus() != null ? req.getStatus() : RentalAreaStatus.ACTIVE)
                .city(city)
                .owner(owner)
                .build();

        rentalArea = rentalAreaRepository.save(rentalArea);

        String folder = "rentals/" + rentalArea.getRentalAreaId();

        List<CloudinaryUploadResult> uploaded = cloudinaryService.uploadImages(images, folder);

        List<RentalAreaImage> entities = new ArrayList<>();
        for (int i = 0; i < uploaded.size(); i++) {
            CloudinaryUploadResult u = uploaded.get(i);

            RentalAreaImage img = RentalAreaImage.builder()
                    .rentalArea(rentalArea)
                    .imageUrl(u.getUrl())
                    .publicId(u.getPublicId())
                    .isCover(i == 0)     // ảnh đầu tiên làm cover
                    .sortOrder(i)
                    .build();

            entities.add(img);
        }

        rentalAreaImageRepository.saveAll(entities);

        List<RentalAreaImageResponse> imageResponses = entities.stream()
                .sorted(Comparator.comparing(RentalAreaImage::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(img -> RentalAreaImageResponse.builder()
                        .rentalAreaImageId(img.getRentalAreaImageId())
                        .imageUrl(img.getImageUrl())
                        .isCover(img.getIsCover())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());


        return RentalAreaResponse.builder()
                .rentalAreaId(rentalArea.getRentalAreaId())
                .rentalAreaName(rentalArea.getRentalAreaName())
                .address(rentalArea.getAddress())
                .contactName(rentalArea.getContactName())
                .contactPhone(rentalArea.getContactPhone())
                .status(rentalArea.getStatus().name())
                .images(imageResponses)
                .build();
    }



    @Override
    public PageResponse<RentalAreaResponse> getAllRentalAreas(int page, int size,
                                                              String address,
                                                              String renterAreaName,
                                                              LocalDate from,
                                                              LocalDate to) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.Direction.DESC, "createdAt");

        Specification<RentalArea> spec = RentalAreaSpecification.filter(address, renterAreaName, from, to);
        Page<RentalArea> rentalAreas = rentalAreaRepository.findAll(spec, pageable);

        List<RentalAreaResponse> data = rentalAreas.stream().map(rentalArea -> {


            List<RoomResponse> roomResponses = rentalArea.getRoom().stream().map(room -> {

                List<RoomImageResponse> images = room.getImages().stream().map(img ->
                                RoomImageResponse.builder()
                                        .roomImageId(img.getRoomImageId())
                                        .imageUrl(img.getImageUrl())
                                        .isCover(img.getIsCover())
                                        .sortOrder(img.getSortOrder())
                                        .build())
                        .toList();

                return RoomResponse.builder()
                        .roomId(room.getRoomId())
                        .roomName(room.getRoomName())
                        .price(room.getPrice())
                        .images(images)

                        .build();
            }).toList();

            return RentalAreaResponse.builder()
                    .rentalAreaId(rentalArea.getRentalAreaId())
                    .address(rentalArea.getAddress())
                    .cityName(rentalArea.getCity().getCityName())
                    .contactPhone(rentalArea.getContactPhone())
                    .rooms(roomResponses)
                    .build();
        }).toList();
        return PageResponse.<RentalAreaResponse>builder()
                .currentPage(rentalAreas.getNumber() + 1)
                .totalPages(rentalAreas.getTotalPages())
                .pageSize(rentalAreas.getSize())
                .totalElements(rentalAreas.getTotalElements())
                .data(data)
                .build();
    }

    @Override
    public List<RentalAreaResponse> getRentalAreasByUserId(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        List<RentalArea> rentalAreas = rentalAreaRepository.findByOwnerId(userId);
        return rentalAreas.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RentalAreaResponse getRentalAreaById(UUID rentalAreaId) {
        RentalArea rentalArea = rentalAreaRepository.findByIdActive(rentalAreaId)
                .orElseThrow(() -> new AppException(ErrorCode.RENTAL_AREA_NOT_FOUND));
        return mapToResponse(rentalArea);
    }

    private RentalAreaResponse mapToResponse(RentalArea rentalArea) {
        List<RentalAreaImageResponse> imageResponses = rentalAreaImageRepository.findByRentalArea(rentalArea)
                .stream()
                .sorted(Comparator.comparing(RentalAreaImage::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(img -> RentalAreaImageResponse.builder()
                        .rentalAreaImageId(img.getRentalAreaImageId())
                        .imageUrl(img.getImageUrl())
                        .isCover(img.getIsCover())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());
        List<RoomResponse> roomResponses = rentalArea.getRoom().stream().map(room -> {

            List<RoomImageResponse> images = room.getImages().stream().map(img ->
                            RoomImageResponse.builder()
                                    .roomImageId(img.getRoomImageId())
                                    .imageUrl(img.getImageUrl())
                                    .isCover(img.getIsCover())
                                    .sortOrder(img.getSortOrder())
                                    .build())
                    .toList();


           Set<RoomResponse.AmenityItem> amenities = room.getAmenities().stream()
                    .map(a -> RoomResponse.AmenityItem.builder()
                            .amenityId(a.getAmenityId())
                            .amenityName(a.getAmenityName())
                            .iconKey(a.getIconKey())
                            .build())
                    .collect(Collectors.toSet());

           List<RoomCopyResponse> roomCopyResponses = room.getRoomCopies().stream()
                   .filter(rc -> rc.getRoomCopyStatus() == RoomCopyStatus.AVAILABLE)
                    .map(rc -> RoomCopyResponse.builder()
                            .roomCopyId(rc.getRoomCopyId())
                            .roomCode(rc.getRoomCode())
                            .roomCopyStatus(rc.getRoomCopyStatus())
                            .build())
                    .toList();

            return RoomResponse.builder()
                    .roomId(room.getRoomId())
                    .roomName(room.getRoomName())
                    .price(room.getPrice())
                    .images(images)
                    .capacity(room.getCapacity())
                    .amenities(amenities)
                    .categoryId(room.getCategory().getCategoryId())
                    .categoryName(room.getCategory().getCategoryName())
                    .roomCopies(roomCopyResponses)
                    .build();
        }).toList();
        return RentalAreaResponse.builder()
                .rentalAreaId(rentalArea.getRentalAreaId())
                .rentalAreaName(rentalArea.getRentalAreaName())
                .address(rentalArea.getAddress())
                .contactName(rentalArea.getContactName())
                .contactPhone(rentalArea.getContactPhone())
                .status(rentalArea.getStatus().name())
                .cityId(rentalArea.getCity().getCityId())
                .cityName(rentalArea.getCity().getCityName())
                .images(imageResponses)
                .rooms(roomResponses)
                .ownerId(rentalArea.getOwner().getUserId())
                .ownerName(rentalArea.getOwner().getUserName())
                .build();
    }

    @Override
    @Transactional
    public void deleteRentalArea(UUID rentalAreaId, UUID currentUserId, String currentUserRole) {
        RentalArea rentalArea = rentalAreaRepository.findByIdActive(rentalAreaId)
                .orElseThrow(() -> new AppException(ErrorCode.RENTAL_AREA_NOT_FOUND));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUserRole);

        if (!isAdmin && !rentalArea.getOwner().getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        rentalArea.setDeletedAt(LocalDateTime.now());
        rentalAreaRepository.save(rentalArea);
    }

    @Override
    @Transactional
    public RentalAreaResponse updateRentalArea(UUID rentalAreaId, UpdateRentalAreaRequest req,
                                               UUID currentUserId, String currentUserRole) {

        RentalArea rentalArea = rentalAreaRepository.findByIdActive(rentalAreaId)
                .orElseThrow(() -> new AppException(ErrorCode.RENTAL_AREA_NOT_FOUND));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUserRole);
        if (!isAdmin && !rentalArea.getOwner().getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        City city = cityRepository.findById(req.getCityId())
                .orElseThrow(() -> new NoSuchElementException("City not found"));

        rentalArea.setRentalAreaName(req.getRentalAreaName());
        rentalArea.setAddress(req.getAddress());
        rentalArea.setContactName(req.getContactName());
        rentalArea.setContactPhone(req.getContactPhone());
        rentalArea.setCity(city);

        rentalAreaRepository.save(rentalArea);
        return mapToResponse(rentalArea);
    }

    @Override
    @Transactional
    public RentalAreaResponse updateRentalAreaStatus(UUID rentalAreaId, UpdateRentalAreaStatusRequest req,
                                                     UUID currentUserId, String currentUserRole) {

        RentalArea rentalArea = rentalAreaRepository.findByIdActive(rentalAreaId)
                .orElseThrow(() -> new AppException(ErrorCode.RENTAL_AREA_NOT_FOUND));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUserRole);
        if (!isAdmin && !rentalArea.getOwner().getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        RentalAreaStatus newStatus = req.getStatus();
        if (!isAdmin && newStatus == RentalAreaStatus.SUSPENDED) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (newStatus != RentalAreaStatus.ACTIVE && newStatus != RentalAreaStatus.INACTIVE) {
            throw new IllegalArgumentException("Status must be ACTIVE or INACTIVE");
        }

        rentalArea.setStatus(newStatus);
        rentalAreaRepository.save(rentalArea);

        return mapToResponse(rentalArea);
    }
}
