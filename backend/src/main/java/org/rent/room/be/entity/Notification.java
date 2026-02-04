package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.rent.room.be.base.BaseEntity;
import org.rent.room.be.constant.NotificationType;


import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
@Table(name = "notifications", indexes = {
        @Index(name = "idx_recipient_read", columnList = "recipient_id, is_read"),
        @Index(name = "idx_recipient_created", columnList = "recipient_id, created_at"),
        @Index(name = "idx_type", columnList = "notification_type")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id")
    UUID notificationId;

    /**
     * Loại thông báo - enum để dễ quản lý và mở rộng
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 50)
    NotificationType notificationType;

    /**
     * Tiêu đề thông báo
     */
    @Column(name = "notification_title", length = 255, nullable = false)
    String notificationTitle;

    /**
     * Nội dung thông báo
     */
    @Column(name = "notification_body", length = 1000)
    String notificationBody;

    /**
     * Người gửi (optional - null nếu là system notification)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    User sender;

    /**
     * Người nhận
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    User recipient;

    /**
     * Dữ liệu bổ sung dạng JSON (flexible)
     * VD: {"bookingId": 123, "roomName": "Phòng A101", "amount": 500000}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_data", columnDefinition = "jsonb")
    private Map<String, Object> notificationData;

    /**
     * Trạng thái đã đọc
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    boolean read = false;

    /**
     * Thời điểm đọc
     */
    @Column(name = "read_at")
    LocalDateTime readAt;

    /**
     * Soft delete
     */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    boolean deleted = false;

    /**
     * Thời điểm xóa
     */
    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    // Helper methods

    /**
     * Đánh dấu đã đọc
     */
    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }

    /**
     * Đánh dấu chưa đọc
     */
    public void markAsUnread() {
        this.read = false;
        this.readAt = null;
    }

    /**
     * Soft delete
     */
    public void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * Restore
     */
    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
    }

    /**
     * Check if notification is from system
     */
    public boolean isSystemNotification() {
        return this.sender == null;
    }

    /**
     * Get icon from notification type
     */
    public String getIcon() {
        return this.notificationType != null ? this.notificationType.getIcon() : "🔔";
    }
}