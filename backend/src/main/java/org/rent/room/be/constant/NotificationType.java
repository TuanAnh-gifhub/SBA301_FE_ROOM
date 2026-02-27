package org.rent.room.be.constant;


import lombok.Getter;

/**
 * Enum định nghĩa các loại thông báo trong hệ thống
 * Mỗi loại có displayName (tiêu đề mặc định) và icon
 */
@Getter
public enum NotificationType {

    // ==================== RENTER NOTIFICATIONS ====================

    /**
     * Renter đặt phòng thành công
     */
    BOOKING_CREATED("Đặt phòng thành công", "📅", NotificationCategory.BOOKING),

    /**
     * Owner xác nhận booking
     */
    BOOKING_CONFIRMED("Đặt phòng được xác nhận", "✅", NotificationCategory.BOOKING),

    /**
     * Owner từ chối booking
     */
    BOOKING_REJECTED("Đặt phòng bị từ chối", "❌", NotificationCategory.BOOKING),

    /**
     * Nhắc nhở trước giờ sử dụng phòng
     */
    BOOKING_REMINDER("Nhắc nhở sử dụng phòng", "🔔", NotificationCategory.BOOKING),

    /**
     * Nhắc xác nhận hoàn thành booking
     */
    BOOKING_COMPLETION_REMINDER("Nhắc xác nhận hoàn thành", "⏰", NotificationCategory.BOOKING),

    /**
     * Booking hoàn thành, tiền đã chuyển cho owner
     */
    BOOKING_COMPLETED_PAYMENT_RELEASED("Hoàn thành đặt phòng", "✅", NotificationCategory.PAYMENT),

    /**
     * Owner hủy booking
     */
    OWNER_CANCELLED_BOOKING("Chủ phòng hủy đặt chỗ", "❌", NotificationCategory.BOOKING),

    /**
     * Owner gửi tin nhắn
     */
    OWNER_MESSAGE_RECEIVED("Tin nhắn từ chủ phòng", "💬", NotificationCategory.MESSAGE),

    /**
     * Nạp tiền vào ví thành công
     */
    WALLET_TOPPED_UP("Nạp tiền thành công", "💰", NotificationCategory.PAYMENT),

    /**
     * Rút tiền thành công
     */
    WALLET_WITHDRAWAL_SUCCESS("Rút tiền thành công", "💸", NotificationCategory.PAYMENT),

    /**
     * Số dư không đủ để đặt phòng
     */
    INSUFFICIENT_BALANCE("Số dư không đủ", "⚠️", NotificationCategory.PAYMENT),

    /**
     * Hoàn tiền khi booking bị hủy
     */
    REFUND_PROCESSED("Hoàn tiền thành công", "💰", NotificationCategory.PAYMENT),

    // ==================== OWNER NOTIFICATIONS ====================

    /**
     * Có booking request mới
     */
    NEW_BOOKING_REQUEST("Yêu cầu đặt phòng mới", "🔔", NotificationCategory.BOOKING),

    /**
     * Nhắc nhở có booking chờ xác nhận
     */
    PENDING_BOOKING_REMINDER("Nhắc xác nhận đặt phòng", "⏰", NotificationCategory.BOOKING),

    /**
     * Renter xác nhận hoàn thành booking
     */
    BOOKING_COMPLETED_BY_RENTER("Người thuê xác nhận hoàn thành", "✅", NotificationCategory.BOOKING),

    /**
     * Nhận được tiền thanh toán
     */
    PAYMENT_RECEIVED("Nhận thanh toán", "💰", NotificationCategory.PAYMENT),

    /**
     * Renter hủy booking
     */
    RENTER_CANCELLED_BOOKING("Người thuê hủy đặt chỗ", "❌", NotificationCategory.BOOKING),

    /**
     * Bài đăng được xuất bản thành công
     */
    LISTING_PUBLISHED("Bài đăng đã được xuất bản", "✅", NotificationCategory.LISTING),

    /**
     * Bài đăng được admin duyệt
     */
    LISTING_APPROVED("Bài đăng đã được duyệt", "✅", NotificationCategory.LISTING),

    /**
     * Bài đăng bị từ chối
     */
    LISTING_REJECTED("Bài đăng bị từ chối", "❌", NotificationCategory.LISTING),

    /**
     * Gói dịch vụ sắp hết hạn (7 ngày)
     */
    LISTING_PACKAGE_EXPIRING_SOON("Gói dịch vụ sắp hết hạn", "⚠️", NotificationCategory.LISTING),

    /**
     * Gói dịch vụ sắp hết hạn (1 ngày)
     */
    LISTING_PACKAGE_EXPIRING_TOMORROW("Gói dịch vụ hết hạn trong 1 ngày", "⚠️", NotificationCategory.LISTING),

    /**
     * Bài đăng đã hết hạn
     */
    LISTING_EXPIRED("Bài đăng đã hết hạn", "❌", NotificationCategory.LISTING),

    /**
     * Có câu hỏi từ renter
     */
    RENTER_INQUIRY("Câu hỏi từ người thuê", "💬", NotificationCategory.MESSAGE),

    /**
     * Renter gửi tin nhắn
     */
    RENTER_MESSAGE_RECEIVED("Tin nhắn từ người thuê", "💬", NotificationCategory.MESSAGE),

    // ==================== ADMIN NOTIFICATIONS ====================

    /**
     * Bài đăng mới chờ duyệt
     */
    NEW_LISTING_PENDING_APPROVAL("Bài đăng chờ duyệt", "🔍", NotificationCategory.MODERATION),

    /**
     * User báo cáo listing hoặc user khác
     */
    USER_REPORT_RECEIVED("Báo cáo từ người dùng", "⚠️", NotificationCategory.MODERATION),

    /**
     * Tranh chấp giữa owner và renter
     */
    DISPUTE_RAISED("Tranh chấp mới", "🚨", NotificationCategory.MODERATION),

    /**
     * Yêu cầu rút tiền chờ xử lý
     */
    WITHDRAWAL_REQUEST_PENDING("Yêu cầu rút tiền", "💰", NotificationCategory.PAYMENT),

    /**
     * Giao dịch bất thường cần kiểm tra
     */
    SUSPICIOUS_TRANSACTION("Giao dịch bất thường", "🚨", NotificationCategory.SECURITY),

    // ==================== SYSTEM NOTIFICATIONS ====================

    /**
     * Thông báo hệ thống chung
     */
    SYSTEM_ANNOUNCEMENT("Thông báo hệ thống", "📢", NotificationCategory.SYSTEM),

    /**
     * Bảo trì hệ thống
     */
    SYSTEM_MAINTENANCE("Bảo trì hệ thống", "🔧", NotificationCategory.SYSTEM),

    /**
     * Cập nhật tính năng mới
     */
    FEATURE_UPDATE("Tính năng mới", "🎉", NotificationCategory.SYSTEM),

    /**
     * Cảnh báo bảo mật
     */
    SECURITY_ALERT("Cảnh báo bảo mật", "🔒", NotificationCategory.SECURITY);

    private final String displayName;
    private final String icon;
    private final NotificationCategory category;

    NotificationType(String displayName, String icon, NotificationCategory category) {
        this.displayName = displayName;
        this.icon = icon;
        this.category = category;
    }

    /**
     * Enum phân loại notification để dễ filter
     */
    public enum NotificationCategory {
        BOOKING,      // Liên quan đến đặt phòng
        PAYMENT,      // Liên quan đến thanh toán
        LISTING,      // Liên quan đến bài đăng
        MESSAGE,      // Tin nhắn
        MODERATION,   // Kiểm duyệt (admin)
        SECURITY,     // Bảo mật
        SYSTEM        // Hệ thống
    }

    /**
     * Check if this notification type is for admin only
     */
    public boolean isAdminOnly() {
        return this.category == NotificationCategory.MODERATION;
    }

    /**
     * Check if this notification type is system-wide
     */
    public boolean isSystemWide() {
        return this.category == NotificationCategory.SYSTEM;
    }
}
