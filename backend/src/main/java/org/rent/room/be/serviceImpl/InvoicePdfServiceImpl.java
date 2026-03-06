package org.rent.room.be.serviceImpl;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;


import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.dto.response.slot.SlotResponse;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.Payment;
import org.rent.room.be.entity.User;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.service.InvoicePdfService;
import org.rent.room.be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class InvoicePdfServiceImpl implements InvoicePdfService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private BookingQRServiceImpl bookingQRService;
    @Override
    public String generateInvoice(Booking booking, List<SlotResponse> slots, Payment payment) throws IOException {

        String fileName = "invoice_" + booking.getBookingId() + ".pdf";
        String path = "uploads/invoices/" + fileName;

        Files.createDirectories(Paths.get("uploads/invoices"));

        PdfWriter writer = new PdfWriter(path);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        InputStream fontStream = getClass()
                .getResourceAsStream("/fonts/NotoSans-Regular.ttf");

        if (fontStream == null) {
            throw new RuntimeException("Không tìm thấy font");
        }

        PdfFont unicodeFont = PdfFontFactory.createFont(
                fontStream.readAllBytes(),
                PdfEncodings.IDENTITY_H
        );

        document.setFont(unicodeFont);

        Color PRIMARY = new DeviceRgb(0, 150, 136);
        Color SECONDARY = new DeviceRgb(33, 150, 243);
        Color ACCENT = new DeviceRgb(255, 193, 7);
        Color SUCCESS = new DeviceRgb(76, 175, 80);
        Color LIGHT_BG = new DeviceRgb(245, 250, 255);


        document.add(
                new Paragraph("Hóa đơn đặt phòng")
                        .setFontSize(22)
                        .setBold()
                        .setFontColor(PRIMARY)
                        .setTextAlignment(TextAlignment.CENTER)
        );
        document.add(new Paragraph("Hệ thống Edu Room - Dịch vụ cho thuê phòng học").setItalic()
                .setFontSize(16)
                .setFontColor(SECONDARY)
                .setTextAlignment(TextAlignment.CENTER)
        );

        document.add(new Paragraph(" ").setMarginBottom(10));

        Table infoTable = new Table(2).useAllAvailableWidth();
        infoTable.setBackgroundColor(LIGHT_BG);

        infoTable.addCell(createLabelCell("Mã đặt phòng:", PRIMARY));
        infoTable.addCell(createValueCell(booking.getBookingId().toString()));

        infoTable.addCell(createLabelCell("Khách hàng:", PRIMARY));
        infoTable.addCell(createValueCell(booking.getRenter().getUserName()));

        infoTable.addCell(createLabelCell("Check-in:", PRIMARY));
        infoTable.addCell(createValueCell(booking.getStartTime().toString()));

        infoTable.addCell(createLabelCell("Check-out:", PRIMARY));
        infoTable.addCell(createValueCell(booking.getEndTime().toString()));

        document.add(infoTable);

        document.add(new Paragraph("\n"));


        document.add(
                new Paragraph("THÔNG TIN THANH TOÁN")
                        .setBold()
                        .setFontColor(SECONDARY)
                        .setFontSize(16)
        );

        Table paymentTable = new Table(2).useAllAvailableWidth();
        paymentTable.setBackgroundColor(new DeviceRgb(250, 250, 250));

        paymentTable.addCell(createLabelCell("Tổng tiền:", SECONDARY));
        paymentTable.addCell(createValueCell(booking.getTotalPrice() + " VND"));

        paymentTable.addCell(createLabelCell("Phương thức:", SECONDARY));
        paymentTable.addCell(createValueCell(payment.getPaymentMethod().name()));

        paymentTable.addCell(createLabelCell("Trạng thái:", SECONDARY));
        paymentTable.addCell(
                new Cell()
                        .add(new Paragraph(payment.getPaymentStatus().name())
                                .setFontColor(SUCCESS)
                                .setBold())
                        .setBorder(Border.NO_BORDER)
        );

        document.add(paymentTable);

        document.add(new Paragraph("\n"));


        document.add(
                new Paragraph("CHI TIẾT PHÒNG")
                        .setBold()
                        .setFontColor(ACCENT)
                        .setFontSize(16)
        );

        float[] columnWidths = {150, 120, 120, 100};
        Table table = new Table(columnWidths);
        table.useAllAvailableWidth();


        table.addHeaderCell(createHeaderCell("Mã Phòng", PRIMARY));
        table.addHeaderCell(createHeaderCell("Bắt đầu", PRIMARY));
        table.addHeaderCell(createHeaderCell("Kết thúc", PRIMARY));
        table.addHeaderCell(createHeaderCell("Trạng thái", PRIMARY));

        for (SlotResponse slot : slots) {
            table.addCell(createBodyCell(slot.getRoomCopy().getRoomCode()));
            table.addCell(createBodyCell(slot.getStartTime().toString()));
            table.addCell(createBodyCell(slot.getEndTime().toString()));
            table.addCell(createBodyCell(slot.getStatus().name()));
        }

        document.add(table);

        document.add(new Paragraph("\n"));
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("\n"));
        document.add(
                new Paragraph("MÃ QR CHECK-IN / CHECK-OUT")
                        .setBold()
                        .setFontColor(PRIMARY)
                        .setFontSize(16)
        );


        byte[] qrCheckInBytes = bookingQRService
                .generateBookingQr(booking.getBookingId(), QRType.CHECK_IN);

        ImageData checkInData = ImageDataFactory.create(qrCheckInBytes);
        Image checkInImage = new Image(checkInData).setWidth(150);


        byte[] qrCheckOutBytes = bookingQRService
                .generateBookingQr(booking.getBookingId(), QRType.CHECK_OUT);

        ImageData checkOutData = ImageDataFactory.create(qrCheckOutBytes);
        Image checkOutImage = new Image(checkOutData).setWidth(150);


        Table qrTable = new Table(2).useAllAvailableWidth();

        qrTable.addCell(
                new Cell()
                        .add(new Paragraph("CHECK-IN").setBold().setTextAlignment(TextAlignment.CENTER))
                        .add(checkInImage.setHorizontalAlignment(HorizontalAlignment.CENTER))
                        .setBorder(Border.NO_BORDER)
        );

        qrTable.addCell(
                new Cell()
                        .add(new Paragraph("CHECK-OUT").setBold().setTextAlignment(TextAlignment.CENTER))
                        .add(checkOutImage.setHorizontalAlignment(HorizontalAlignment.CENTER))
                        .setBorder(Border.NO_BORDER)
        );

        document.add(qrTable);

        document.add(
                new Paragraph("Cảm ơn bạn đã sử dụng dịch vụ!")
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(PRIMARY)
                        .setItalic()
        );

        document.close();

        return "/invoices/" + fileName;
    }

    @Override
    public Resource downloadInvoice(UUID bookingId) throws IOException {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt lịch"));

        User user = userService.getCurrentUserEntity();

        if (!booking.getRenter().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("Không được phép tải hóa đơn này");
        }

        if (booking.getInvoiceUrl() == null) {
            throw new RuntimeException("Booking chưa có hóa đơn");
        }

        String fileName = Paths.get(booking.getInvoiceUrl())
                .getFileName()
                .toString();
        System.err.println("File name: " + fileName);
        Path path = Paths.get("uploads/invoices").resolve(fileName);
        System.err.println("Resolved path: " + path.toAbsolutePath());
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File không tồn tại");
        }

        return resource;
    }


    private Cell createHeaderCell(String text, Color bgColor) {
        return new Cell()
                .add(new Paragraph(text).setBold().setFontColor(DeviceRgb.WHITE))
                .setBackgroundColor(bgColor)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createLabelCell(String text, Color color) {
        return new Cell()
                .add(new Paragraph(text).setBold().setFontColor(color))
                .setBorder(Border.NO_BORDER);
    }

    private Cell createValueCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setBorder(Border.NO_BORDER);
    }

    private Cell createBodyCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(TextAlignment.CENTER);
    }
}
