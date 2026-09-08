package com.theweplm.signforge.Features.EmploymentOffer.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmploymentOfferRequestDTO {

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

    // Document & Security
    private String offerLetterHtml;
    private String generatedCandidateUrl;
    private String documentHash;
    private String auditTrailJson;
}
