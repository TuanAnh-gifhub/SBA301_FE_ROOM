package org.rent.room.be.service;

import org.rent.room.be.dto.response.slot.SlotResponse;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.Payment;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface InvoicePdfService {

   String generateInvoice(Booking booking,
                                List<SlotResponse> slots,
                                Payment payment) throws IOException;

    Resource  downloadInvoice(UUID bookingId) throws IOException;
}
