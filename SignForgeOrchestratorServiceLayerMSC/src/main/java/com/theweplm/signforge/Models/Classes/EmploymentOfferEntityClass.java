package com.theweplm.signforge.Models.Classes;

import com.theweplm.signforge.Constants.DatabaseCON;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Enterprise Employment Offer Entity Class mapped 1:1 to SF_EmploymentOffersTBL.
 */
@Entity
@Table(name = DatabaseCON.EMPLOYMENT_OFFERS_TABLE)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"candidateSignatureData", "counterSignatureData", "thirdPartySignatureData", "offerLetterHtml"})
public class EmploymentOfferEntityClass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "offer_code", length = 100)
    private String offerCode;

    @Column(name = "document_type", nullable = false, length = 50)
    @Builder.Default
    private String documentType = "OFFER_LETTER";

    @Column(name = "signature_count", nullable = false)
    @Builder.Default
    private Integer signatureCount = 2;

    // Candidate Details
    @Column(name = "candidate_name", nullable = false, length = 200)
    private String candidateName;

    @Column(name = "candidate_email", nullable = false, length = 255)
    private String candidateEmail;

    @Column(name = "candidate_phone", length = 50)
    private String candidatePhone;

    // Position & Role Details
    @Column(name = "designation", nullable = false, length = 200)
    private String designation;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "employment_type", length = 50)
    @Builder.Default
    private String employmentType = "Full-Time";

    @Column(name = "work_location", length = 200)
    private String workLocation;

    @Column(name = "joining_date", length = 50)
    private String joiningDate;

    @Column(name = "expiry_date", length = 50)
    private String expiryDate;

    @Column(name = "reporting_manager_name", length = 200)
    private String reportingManagerName;

    @Column(name = "reporting_manager_title", length = 200)
    private String reportingManagerTitle;

    // Company Details
    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "company_address", columnDefinition = "TEXT")
    private String companyAddress;

    @Column(name = "company_cin", length = 100)
    private String companyCin;

    // Financial Breakdown
    @Column(name = "base_salary", precision = 15, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "variable_pay", precision = 15, scale = 2)
    private BigDecimal variablePay;

    @Column(name = "joining_bonus", precision = 15, scale = 2)
    private BigDecimal joiningBonus;

    @Column(name = "stock_options", length = 200)
    private String stockOptions;

    @Column(name = "total_ctc", precision = 15, scale = 2)
    private BigDecimal totalCtc;

    @Column(name = "annual_ctc", precision = 15, scale = 2)
    private BigDecimal annualCtc;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "probation_period_months")
    private Integer probationPeriodMonths;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Column(name = "relocation_allowance", precision = 15, scale = 2)
    private BigDecimal relocationAllowance;

    @Column(name = "benefits_details", columnDefinition = "TEXT")
    private String benefitsDetails;

    // Status
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "AWAITING_CANDIDATE";

    // Candidate Signature Data
    @Column(name = "candidate_signed_at")
    private Instant candidateSignedAt;

    @Column(name = "candidate_sign_mode", length = 50)
    private String candidateSignMode;

    @Column(name = "candidate_signature_data", columnDefinition = "TEXT")
    private String candidateSignatureData;

    @Column(name = "candidate_sign_ip", length = 100)
    private String candidateSignIp;

    @Column(name = "candidate_sign_user_agent", length = 255)
    private String candidateSignUserAgent;

    // Counter-Sign (HR / Approver 1)
    @Column(name = "counter_signed_at")
    private Instant counterSignedAt;

    @Column(name = "counter_signed_by_user_id")
    private UUID counterSignedByUserId;

    @Column(name = "counter_signed_by_user_name", length = 200)
    private String counterSignedByUserName;

    @Column(name = "counter_sign_mode", length = 50)
    private String counterSignMode;

    @Column(name = "counter_signature_data", columnDefinition = "TEXT")
    private String counterSignatureData;

    // Third-Party Sign (Executive / Approver 2)
    @Column(name = "third_party_signed_at")
    private Instant thirdPartySignedAt;

    @Column(name = "third_party_signed_by_user_id")
    private UUID thirdPartySignedByUserId;

    @Column(name = "third_party_signed_by_user_name", length = 200)
    private String thirdPartySignedByUserName;

    @Column(name = "third_party_sign_mode", length = 50)
    private String thirdPartySignMode;

    @Column(name = "third_party_signature_data", columnDefinition = "TEXT")
    private String thirdPartySignatureData;

    // Document HTML, Generated URLs & Hashes
    @Column(name = "offer_letter_html", columnDefinition = "TEXT")
    private String offerLetterHtml;

    @Column(name = "generated_candidate_url", columnDefinition = "TEXT")
    private String generatedCandidateUrl;

    @Column(name = "generated_countersign_url", columnDefinition = "TEXT")
    private String generatedCountersignUrl;

    @Column(name = "generated_third_party_url", columnDefinition = "TEXT")
    private String generatedThirdPartyUrl;

    @Column(name = "document_hash", length = 128)
    private String documentHash;

    @Column(name = "audit_trail_json", columnDefinition = "TEXT")
    private String auditTrailJson;

    // Metadata
    @Column(name = "created_by_id")
    private UUID createdById;

    @Column(name = "created_by_name", length = 200)
    private String createdByName;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
