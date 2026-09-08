package com.theweplm.signforge.Features.EmploymentOffer.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSignRequestDTO {

    private UUID offerId;
    private String documentHash;
    private String signMode;
    private String signatureData;
    private String updatedHtml;
    private String ipAddress;
    private String userAgent;
}
