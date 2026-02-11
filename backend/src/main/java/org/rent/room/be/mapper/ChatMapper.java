package org.rent.room.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.dto.response.chat.ConversationResponse;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.entity.Conversation;
import org.rent.room.be.entity.Message;
import org.rent.room.be.entity.User;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    @Mapping(target = "role", source = "role.roleName")
    UserResponse toUserResponse(User user);

    // Map Conversation sang ConversationResponse
    @Mapping(target = "sender", source = "sender")
    @Mapping(target = "recipient", source = "recipient")
    ConversationResponse toConversationResponse(Conversation conversation);

    // Map Message sang MessageResponse (Dùng cho hàm getMessages)
    @Mapping(target = "messageId", source = "messageId")
    @Mapping(target = "senderId", source = "sender.userId")
    @Mapping(target = "content", source = "messageBody")
    MessageResponse toMessageResponse(Message message);
}
