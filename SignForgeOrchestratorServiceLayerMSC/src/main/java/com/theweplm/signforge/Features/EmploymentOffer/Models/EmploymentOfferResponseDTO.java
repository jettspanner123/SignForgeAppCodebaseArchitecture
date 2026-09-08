package com.theweplm.signforge.Features.EmploymentOffer.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmploymentOfferResponseDTO {

    private UUID id;
    private String offerCode;
    private String documentType;
    private Integer signatureCount;

    // Candidate Details
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;

    // Position Details
    private String designation;
    private String department;
    private String employmentType;
    private String workLocation;
    private String joiningDate;
    private String expiryDate;
    private String reportingManagerName;
    private String reportingManagerTitle;

    // Company Details
    private String companyName;
    private String companyAddress;
    private String companyCin;

    // Financial Breakdown
    private BigDecimal baseSalary;
    private BigDecimal variablePay;
    private BigDecimal joiningBonus;
    private String stockOptions;
    private BigDecimal totalCtc;
    private BigDecimal annualCtc;
    private String currency;
    private Integer probationPeriodMonths;
    private Integer noticePeriodDays;
    private BigDecimal relocationAllowance;
    private String benefitsDetails;

    // Status
    private String status;

    // Candidate Signature Data
    private Instant candidateSignedAt;
    private String candidateSignMode;
    private String candidateSignatureData;
    private String candidateSignIp;
    private String candidateSignUserAgent;

    // Counter-Sign (HR)
    private Instant counterSignedAt;
    private UUID counterSignedByUserId;
    private String counterSignedByUserName;
    private String counterSignMode;
    private String counterSignatureData;

    // Third-Party Sign (Executive)
    private Instant thirdPartySignedAt;
    private UUID thirdPartySignedByUserId;
    private String thirdPartySignedByUserName;
    private String thirdPartySignMode;
    private String thirdPartySignatureData;

    // Document & Security
    private String offerLetterHtml;
    private String generatedCandidateUrl;
    private String generatedCountersignUrl;
    private String generatedThirdPartyUrl;
    private String documentHash;
    private String auditTrailJson;

    // Audit Metadata
    private UUID createdById;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;
}
