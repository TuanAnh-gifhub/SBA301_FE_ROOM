package org.rent.room.be.constant;

public enum WalletTxType {
    DEPOSIT,           // Nạp tiền vào ví qua cổng thanh toán
    WITHDRAW,          // Rút tiền về ngân hàng (ADMIN đã duyệt)
    WITHDRAW_REJECTED, // Yêu cầu rút bị từ chối → hoàn tiền về balance
    BOOKING_INCOME,    // Nhận tiền thuê phòng từ escrow (sau 7 ngày)
    BOOKING_PAYMENT,   // Thanh toán đặt phòng bằng số dư ví
    PACKAGE_PURCHASE,  // Mua gói đăng bài (OWNER)
    COMMISSION,        // Hoa hồng sàn
    REFUND,            // Hoàn tiền từ dispute
    FREEZE_HOLD,       // Đóng băng số tiền
    FREEZE_RELEASE     // Giải phóng số tiền bị đóng băng
}

