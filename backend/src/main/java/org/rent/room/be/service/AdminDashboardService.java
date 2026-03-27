package org.rent.room.be.service;

import org.rent.room.be.dto.response.dashboard.AdminChartResponse;

public interface AdminDashboardService {
    AdminChartResponse getChartData();
}
