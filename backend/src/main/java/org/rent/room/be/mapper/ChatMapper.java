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

    @Mapping(target = "user1", source = "user1")
    @Mapping(target = "user2", source = "user2")
    ConversationResponse toConversationResponse(Conversation conversation);

    @Mapping(target = "messageId", source = "messageId")
    @Mapping(target = "senderId", source = "sender.userId")
    @Mapping(target = "content", source = "messageBody")
    MessageResponse toMessageResponse(Message message);
}
