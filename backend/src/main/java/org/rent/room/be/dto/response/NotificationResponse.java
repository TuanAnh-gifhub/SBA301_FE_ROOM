package org.rent.room.be.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Response wrapper cho danh sách notifications với pagination
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    /**
     * Danh sách notifications
     */
    private List<NotificationDTO> notifications;

    /**
     * Số lượng notifications chưa đọc
     */
    private Long unreadCount;

    /**
     * Pagination info
     */
    private PaginationInfo pagination;

    /**
     * Statistics (optional)
     */
    private Map<String, Object> statistics;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private Integer currentPage;
        private Integer pageSize;
        private Integer totalPages;
        private Long totalElements;
        private Boolean hasNext;
        private Boolean hasPrevious;
    }
}
