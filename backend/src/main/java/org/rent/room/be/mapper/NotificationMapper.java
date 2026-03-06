package org.rent.room.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.rent.room.be.dto.response.notification.NotificationResponse;
import org.rent.room.be.entity.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "recipient.userId", target = "recipientId")
    @Mapping(source = "createdAt", target = "createdAt")
    NotificationResponse toResponse(Notification notification);
}