package org.rent.room.be.dto.response.post;

import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.constant.PostStatus;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;

import java.util.UUID;

@Getter
@Builder
public class PostDTOResponse {
    UUID postId;
    UUID userId;
    String ownerName;
    String ownerPhone;
    String title;
    String content;
    PostStatus postStatus;
    RentalAreaResponse rentalArea;
}
