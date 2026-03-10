package org.rent.room.be.dto.request.review;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReviewRequest {

    @NotNull(message = "bookingId khong duoc de trong")
    UUID bookingId;

    @NotNull(message = "rating khong duoc de trong")
    @Min(value = 1, message = "Rating toi thieu la 1 sao")
    @Max(value = 5, message = "Rating toi da la 5 sao")
    Integer rating;

    /**
     * Noi dung review - khong bat buoc.
     * Neu co dien: min 10, max 2000 ky tu.
     * Neu de trong (null hoac blank) -> bo qua validation min length.
     */
    @Size(min = 10, max = 2000,
            message = "Noi dung phai tu 10 den 2000 ky tu")
    String comment;

    /**
     * Quick tags - khong bat buoc.
     * Toi da 5 tags. Cac gia tri hop le kiem tra o Service layer
     * qua ReviewTagConstant.VALID_TAGS.
     */
    @Size(max = 5, message = "Toi da 5 tags moi review")
    @Builder.Default
    List<String> tags = new ArrayList<>();

    /**
     * URL cua anh/video da upload len S3/Cloudinary o buoc truoc.
     * Toi da 5 file. URL phai la domain cua he thong (kiem tra o Service).
     */
    @Size(max = 5, message = "Toi da 5 file dinh kem moi review")
    @Builder.Default
    List<String> mediaUrls = new ArrayList<>();
}
