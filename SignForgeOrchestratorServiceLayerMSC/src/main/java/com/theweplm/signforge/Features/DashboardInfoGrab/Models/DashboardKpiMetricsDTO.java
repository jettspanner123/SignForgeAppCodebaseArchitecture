package com.theweplm.signforge.Features.DashboardInfoGrab.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpiMetricsDTO {

    private long totalPipeline;
    private long awaitingCandidate;
    private long awaitingCountersign;
    private long awaitingThirdPartySign;
    private long fullyExecuted;
    private long drafts;
    private long cancelled;
    private long expired;
    private BigDecimal totalCompensationValue;
    private double executionRatePercentage;
}
