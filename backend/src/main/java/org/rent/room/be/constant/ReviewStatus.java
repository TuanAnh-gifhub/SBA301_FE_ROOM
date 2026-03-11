package org.rent.room.be.constant;

public enum ReviewStatus {
    /**
     * Review da duoc duyet, hien thi binh thuong cho moi nguoi.
     * Day la trang thai mac dinh khi tao moi (neu pass profanity filter).
     */
    APPROVED,

    /**
     * Review dang cho Admin duyet.
     * Xay ra khi: (1) profanity filter phat hien tu ngu doc hai,
     *             (2) so luot report >= nguong quy dinh (vd: 3 reports).
     */
    PENDING_MODERATION,

    /**
     * Review bi Admin tu choi. Khong hien thi cho nguoi dung thuong.
     * User se nhan thong bao.
     */
    REJECTED,

    /**
     * Admin an review tam thoi (co the mo lai). Khong hien thi.
     */
    HIDDEN
}
