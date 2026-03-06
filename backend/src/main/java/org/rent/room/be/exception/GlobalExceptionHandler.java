package org.rent.room.be.exception;

import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.base.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Xử lý lỗi nghiệp vụ định nghĩa trước (AppException)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    // 2. Xử lý lỗi không tìm thấy tài nguyên (Cần thiết cho ChatService của bạn)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFound(ResourceNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.builder()
                        .code(404)
                        .message(e.getMessage())
                        .build());
    }

    // 3. Xử lý lỗi Validation (@Valid trên Controller)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.<Map<String, String>>builder()
                        .code(400) // Hoặc ErrorCode.INVALID_KEY.getCode()
                        .message("Dữ liệu đầu vào không hợp lệ")
                        .result(errors)
                        .build()
        );
    }

    // 4. Xử lý lỗi phân quyền (Access Denied - 403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException e) {
        log.warn("Access denied: {}", e.getMessage());
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED; // Đảm bảo Enum này map với 403 Forbidden

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message("Bạn không có quyền thực hiện hành động này")
                        .build());
    }

    // 5. Xử lý lỗi xác thực (Authentication - 401)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.builder()
                        .code(401)
                        .message("Xác thực thất bại, vui lòng đăng nhập lại")
                        .build());
    }

    // 6. Xử lý lỗi JSON sai định dạng
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleJsonError(HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.builder()
                        .code(400)
                        .message("Cấu trúc JSON không hợp lệ")
                        .build()
        );
    }

    // 7. Xử lý sai Method (GET/POST/PATCH)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(
                ApiResponse.builder()
                        .code(405)
                        .message("Phương thức " + e.getMethod() + " không được hỗ trợ cho URL này")
                        .build()
        );
    }

    // 8. CATCH-ALL: Bắt tất cả các lỗi không mong muốn (500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnwantedException(Exception e) {
        log.error("CRITICAL ERROR: ", e); // Log toàn bộ stacktrace để debug

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.builder()
                        .code(9999)
                        .message("Đã có lỗi hệ thống xảy ra, vui lòng thử lại sau")
                        .build());
    }
}