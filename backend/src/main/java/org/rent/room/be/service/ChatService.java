package org.rent.room.be.service;

import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.MessageResponse;

public interface ChatService {
    MessageResponse saveMessage(MessageRequest request);
}
