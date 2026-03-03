package org.rent.room.be.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.rent.room.be.dto.response.subscription.SubscriptionResponse;
import org.rent.room.be.entity.Subscription;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    @Mapping(source = "user.userId",                    target = "userId")
    @Mapping(source = "user.userName",                  target = "userName")
    @Mapping(source = "rentPackage.rentPackageId",   target = "packageId")
    @Mapping(source = "rentPackage.rentPackageName", target = "packageName")
    @Mapping(source = "rentPackage.price",           target = "price")
    SubscriptionResponse toResponse(Subscription subscription);

    List<SubscriptionResponse> toResponseList(List<Subscription> subscriptions);
}
