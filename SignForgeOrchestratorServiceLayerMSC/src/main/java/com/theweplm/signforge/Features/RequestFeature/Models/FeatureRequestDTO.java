package com.theweplm.signforge.Features.RequestFeature.Models;

import com.theweplm.signforge.Features.Authentication.Models.UserSummaryDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FeatureRequestDTO {

    private UUID id;
    private UUID requesterUserId;
    private UserSummaryDTO requesterUser;
    private UUID targetUserId;
    private UserSummaryDTO targetUser;
    private String title;
    private String featureType;
    private String description;
    private String status;
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}
