package com.emosync.service;

import com.emosync.DTO.response.DataAnalyticsResponseDTO;
import org.springframework.stereotype.Service;

@Service
public interface DataAnalyticsService {
    DataAnalyticsResponseDTO getDataAnalytics(Integer days);
}
