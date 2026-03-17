package org.rent.room.be.dto.request.review;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Chi update nhung field nao co gia tri (partial update).
 * Null = giu nguyen gia tri cu.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateReviewRequest {

    @Min(value = 1, message = "Rating toi thieu la 1 sao")
    @Max(value = 5, message = "Rating toi da la 5 sao")
    Integer rating;

    @Size(min = 10, max = 2000,
            message = "Noi dung phai tu 10 den 2000 ky tu")
    String comment;

    @Size(max = 5, message = "Toi da 5 tags moi review")
    List<String> tags;

    @Size(max = 5, message = "Toi da 5 file dinh kem moi review")
    List<String> mediaUrls;
}
