package org.rent.room.be.dto.request.review;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReplyReviewRequest {

    @NotBlank(message = "Noi dung phan hoi khong duoc de trong")
    @Size(max = 1000, message = "Phan hoi toi da 1000 ky tu")
    String content;
}