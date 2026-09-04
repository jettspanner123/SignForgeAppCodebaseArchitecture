package com.theweplm.signforge.Features.DashboardInfoGrab.Models;

import com.theweplm.signforge.Features.EmploymentOffer.Models.EmploymentOfferResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardInfoGrabResponseDTO {

    private DashboardKpiMetricsDTO metrics;
    private List<DashboardActivityDTO> recentActivities;
    private List<EmploymentOfferResponseDTO> offers;
}
