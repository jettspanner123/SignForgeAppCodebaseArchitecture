package com.theweplm.signforge.Features.DashboardInfoGrab.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardActivityDTO {

    private String id;
    private UUID offerId;
    private String offerCode;
    private String candidateName;
    private String designation;
    private String action;
    private String details;
    private String timestamp;
    private String actorName;
    private String actorRole;
}
