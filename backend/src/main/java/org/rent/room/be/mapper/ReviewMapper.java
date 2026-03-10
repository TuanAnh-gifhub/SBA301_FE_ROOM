package org.rent.room.be.mapper;

import org.mapstruct.*;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.entity.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MapStruct mapper cho Review.
 *
 * Luu y: cac field phu thuoc context (hasVoted, canEdit)
 * khong the tu dong map -> duoc set thu cong trong ReviewServiceImpl
 * sau khi goi toResponse().
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "reviewer", expression = "java(toReviewerInfo(review.getReviewer()))")
    @Mapping(target = "tags", expression = "java(toTagNames(review.getTags()))")
    @Mapping(target = "mediaList", source = "mediaList")
    @Mapping(target = "reply", expression = "java(toReplyInfo(review.getReply()))")
    @Mapping(target = "hasVoted", constant = "false")  // Service set lai sau
    @Mapping(target = "canEdit", constant = "false")   // Service set lai sau
    ReviewResponse toResponse(Review review);

    List<ReviewResponse> toResponseList(List<Review> reviews);

    // ---- Helper methods ----

    default ReviewResponse.ReviewerInfo toReviewerInfo(User user) {
        if (user == null) return null;
        return ReviewResponse.ReviewerInfo.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .build();
    }

    default Set<String> toTagNames(Set<ReviewTag> tags) {
        if (tags == null) return Set.of(); // Sửa List.of() thành Set.of()

        return tags.stream()
                .map(ReviewTag::getTagName)
                .collect(Collectors.toSet()); // Sửa .toList() thành .collect(Collectors.toSet())
    }

    @Mapping(target = "mediaId", source = "mediaId")
    @Mapping(target = "url", source = "url")
    @Mapping(target = "mediaType", source = "mediaType")
    @Mapping(target = "displayOrder", source = "displayOrder")
    ReviewResponse.MediaInfo toMediaInfo(ReviewMedia media);

    default ReviewResponse.ReplyInfo toReplyInfo(ReviewReply reply) {
        if (reply == null) return null;
        return ReviewResponse.ReplyInfo.builder()
                .replyId(reply.getReplyId())
                .ownerName(reply.getOwner() != null ? reply.getOwner().getUserName() : null)
                .content(reply.getContent())
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .build();
    }
}