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
public class ThirdPartySignRequestDTO {

    private UUID offerId;
    private String signMode;
    private String signatureData;
    private String updatedHtml;
}
