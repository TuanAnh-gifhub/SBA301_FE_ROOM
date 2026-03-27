package org.rent.room.be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    //AUTHENTICATION
    LOGIN_FAILED(1000, "Email or Password is invalid!", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1001, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1002, "You do not have permission", HttpStatus.FORBIDDEN),
    REFRESH_TOKEN_NOT_FOUND(1003, "Refresh token not found", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_REVOKED(1004, "Refresh token has been revoked", HttpStatus.FORBIDDEN),
    INVALID_TOKEN_TYPE(1005, "Invalid token type", HttpStatus.BAD_REQUEST),
    LOGOUT_FAILED(1006, "Logout failed", HttpStatus.INTERNAL_SERVER_ERROR),
    REFRESH_TOKEN_EXPIRED(1007, "Refresh token expired", HttpStatus.UNAUTHORIZED),
    SOCIAL_ACCOUNT_REQUIRED(1008, "Social account required", HttpStatus.BAD_REQUEST),

    //User
    USER_EXISTED(2001, "Email existed", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2002, "User not found", HttpStatus.NOT_FOUND),
    USER_NOT_AUTHENTICATED(2003, "User not authenticated", HttpStatus.UNAUTHORIZED),
    EMAIL_NOT_FOUND(2004, "Email not found", HttpStatus.NOT_FOUND),
    USER_LOCKED(2005, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.", HttpStatus.FORBIDDEN),

    //Role
    ROLE_NOT_FOUND(3001, "Role not found", HttpStatus.NOT_FOUND),

    // Page Errors
    INVALID_PAGINATION(4001, "Invalid pagination parameters", HttpStatus.BAD_REQUEST),

    // Package Errors
    RENTPACKAGE_NOT_FOUND(4002, "Package not found", HttpStatus.NOT_FOUND),
    INVALID_RENTPACKAGE(4003, "Invalid package data", HttpStatus.BAD_REQUEST),

    //POST_NOT_FOUND
    POST_NOT_FOUND(4002, "Post not found", HttpStatus.NOT_FOUND), // Lưu ý: Đang bị trùng số 4002 với RENTPACKAGE_NOT_FOUND

    // Rental Area
    RENTAL_AREA_NOT_FOUND(4004, "Rental area not found", HttpStatus.NOT_FOUND),

    // Subscription
    SUBSCRIPTION_ALREADY_ACTIVE(4005, "User already has an active subscription", HttpStatus.BAD_REQUEST),
    SUBSCRIPTION_NOT_FOUND(4006, "Subscription not found", HttpStatus.NOT_FOUND),

    // Thêm dòng này để xử lý lỗi hết lượt đăng / hết hạn gói
    SUBSCRIPTION_REQUIRED(4008, "Bạn chưa đăng ký gói cước nào. Vui lòng nâng cấp tài khoản để đăng tin!", HttpStatus.BAD_REQUEST),
    POST_QUOTA_EXCEEDED(4007, "Bạn đã sử dụng hết lượt đăng tin hoặc gói đã hết hạn. Vui lòng nâng cấp gói mới!", HttpStatus.BAD_REQUEST),

    //QR
    QR_NOT_FOUND(4000, "QR không hợp lệ",HttpStatus.BAD_REQUEST),
    QR_INVALID(4000, "QR không hợp lệ",HttpStatus.BAD_REQUEST),
    QR_ALREADY_USED(4000, "QR đã dùng",HttpStatus.BAD_REQUEST),
    QR_EXPIRED(4000, "QR hết hạn",HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(4004, "Không tìm thấy booking",HttpStatus.NOT_FOUND), // Trùng số 4004 với RENTAL_AREA
    BOOKING_ALREADY_CHECKED_IN(4000, "Đã check-in rồi",HttpStatus.BAD_REQUEST),
    CANNOT_CHECKOUT_BEFORE_CHECKIN(4000, "Chưa check-in thì không thể check-out",HttpStatus.BAD_REQUEST),

    // REVIEW
    REVIEW_NOT_FOUND(5001, "Review not found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(5002, "Bạn đã review booking này rồi", HttpStatus.CONFLICT),
    REVIEW_NOT_OWNER(5003, "Bạn không có quyền thao tác review này", HttpStatus.FORBIDDEN),
    REVIEW_EDIT_EXPIRED(5004, "Đã quá 7 ngày, không thể sửa review", HttpStatus.FORBIDDEN),
    REVIEW_DELETED(5005, "Review này đã bị xóa", HttpStatus.GONE),

    // BOOKING (Review Context)
    BOOKING_NOT_COMPLETED(5011, "Chỉ có thể review sau khi hoàn thành booking", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_BELONG_TO_USER(5012, "Booking này không thuộc về bạn", HttpStatus.FORBIDDEN),
    BOOKING_CANCELLED(5011, "Lịch hẹn đã hủy thì không thẻ quét mã", HttpStatus.BAD_REQUEST), // Trùng 5011

    // REPLY
    REPLY_ALREADY_EXISTS(5020, "Review này đã có phản hồi rồi", HttpStatus.CONFLICT),
    REPLY_NOT_FOUND(5021, "Không tìm thấy phản hồi", HttpStatus.NOT_FOUND),
    REPLY_NOT_OWNER(5022, "Chỉ chủ phòng mới có thể trả lời review", HttpStatus.FORBIDDEN),

    // VOTE
    CANNOT_VOTE_OWN_REVIEW(5030, "Không thể vote review của chính mình", HttpStatus.BAD_REQUEST),

    // TAG
    INVALID_TAG(5040, "Tag không hợp lệ", HttpStatus.BAD_REQUEST),
    TOO_MANY_TAGS(5041, "Tối đa 5 tags mỗi review", HttpStatus.BAD_REQUEST),

    // SLOT EDITING
    INVALID_TIME_RANGE(4100, "Thời gian kết thúc phải sau thời gian bắt đầu", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_EDITABLE(4101, "Booking không ở trạng thái có thể chỉnh sửa", HttpStatus.BAD_REQUEST),
    SLOT_NOT_FOUND(4102, "Không tìm thấy slot", HttpStatus.NOT_FOUND),
    SLOT_CONFLICT(4103, "Thời gian này bị xung đột với booking khác", HttpStatus.CONFLICT),
    SLOT_NOT_BELONG_TO_BOOKING(400, "Slot không thuộc booking này",HttpStatus.BAD_REQUEST),
    SLOT_ALREADY_CANCELLED(400, "Slot đã bị hủy",HttpStatus.BAD_REQUEST),

    // MEDIA
    TOO_MANY_MEDIA(5050, "Tối đa 5 file mỗi review", HttpStatus.BAD_REQUEST),


    // WALLET & PAYMENT
    WALLET_NOT_FOUND(6001, "Không tìm thấy ví của người dùng", HttpStatus.NOT_FOUND),
    WALLET_LOCKED(6002, "Ví của bạn đang bị khóa, không thể thực hiện giao dịch", HttpStatus.FORBIDDEN),
    INSUFFICIENT_BALANCE(6003, "Số dư trong ví không đủ để thanh toán gói cước này", HttpStatus.BAD_REQUEST);

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}