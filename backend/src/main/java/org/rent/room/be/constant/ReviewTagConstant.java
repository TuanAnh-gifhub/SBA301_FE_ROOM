package org.rent.room.be.constant;

import java.util.Set;

/**
 * Cac hang so lien quan den Review feature.
 * Doi tag: chi can sua VALID_TAGS, khong can migration.
 */
public final class ReviewTagConstant {

    private ReviewTagConstant() {}

    public static final Set<String> VALID_TAGS = Set.of(
            "YEN_TINH",
            "SACH_SE",
            "WIFI_TOT",
            "DIEU_HOA_MAT",
            "ANH_SANG_DU",
            "VI_TRI_THUAN_TIEN",
            "CHU_PHONG_THAN_THIEN"
    );

    /** Toi da 5 tag / 1 review */
    public static final int MAX_TAGS = 5;

    /** Toi da 5 file anh/video / 1 review */
    public static final int MAX_MEDIA = 5;

    /** Chi duoc sua review trong vong 7 ngay ke tu ngay tao */
    public static final int EDIT_WINDOW_DAYS = 7;

    /** Min ky tu neu co dien comment */
    public static final int COMMENT_MIN_LENGTH = 10;

    /** Max ky tu comment */
    public static final int COMMENT_MAX_LENGTH = 2000;

    /** Max ky tu reply cua chu phong */
    public static final int REPLY_MAX_LENGTH = 1000;

    /** So luot report toi thieu de tu dong chuyen PENDING_MODERATION */
    public static final int AUTO_MODERATE_REPORT_THRESHOLD = 3;
}