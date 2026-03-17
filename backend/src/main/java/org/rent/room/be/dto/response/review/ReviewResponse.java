package org.rent.room.be.dto.response.review;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.constant.MediaType;
import org.rent.room.be.constant.ReviewStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {

    UUID reviewId;
    ReviewerInfo reviewer;
    Integer rating;
    String comment;
    Set<String> tags;
    List<MediaInfo> mediaList;
    ReplyInfo reply;
    Integer helpfulCount;
    ReviewStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    /**
     * True neu user hien tai da vote "Huu ich" cho review nay.
     * False neu chua vote hoac chua dang nhap.
     */
    boolean hasVoted;

    /**
     * True neu user hien tai co the sua review nay
     * (la chu review VA con trong vong 7 ngay ke tu tao).
     */
    boolean canEdit;

    // ---- Inner classes de giam so file response ----

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewerInfo {
        UUID userId;
        String userName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MediaInfo {
        UUID mediaId;
        String url;
        MediaType mediaType;
        Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReplyInfo {
        UUID replyId;
        String ownerName;
        String content;
        LocalDateTime createdAt;
        LocalDateTime updatedAt;
    }
}