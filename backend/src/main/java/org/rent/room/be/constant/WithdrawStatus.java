package org.rent.room.be.constant;

public enum WithdrawStatus {
    PENDING,    // Chờ ADMIN duyệt
    APPROVED,   // ADMIN đã duyệt, đang chuyển tiền thực tế
    COMPLETED,  // Đã chuyển tiền thành công
    REJECTED    // Bị từ chối, tiền đã hoàn về balance
}

