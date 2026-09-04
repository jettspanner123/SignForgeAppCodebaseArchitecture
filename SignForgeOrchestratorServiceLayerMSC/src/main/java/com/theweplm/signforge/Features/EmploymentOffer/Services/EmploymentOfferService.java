package com.theweplm.signforge.Features.EmploymentOffer.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theweplm.signforge.Features.EmploymentOffer.Assertion.EmploymentOfferAssertion;
import com.theweplm.signforge.Features.EmploymentOffer.Constants.EmploymentOfferCON;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CandidateSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CounterSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CreateEmploymentOfferRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.EmploymentOfferResponseDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.ThirdPartySignRequestDTO;
import com.theweplm.signforge.Models.Classes.EmploymentOfferEntityClass;
import com.theweplm.signforge.Repositories.IEmploymentOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmploymentOfferService implements IEmploymentOfferService {

    private final IEmploymentOfferRepository employmentOfferRepository;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    @Transactional
    public EmploymentOfferResponseDTO createEmploymentOffer(CreateEmploymentOfferRequestDTO request, UUID currentUserId, String currentUserName) {
        log.info("Creating new employment offer for candidate: {}", request.getCandidateName());

        String generatedCode = request.getOfferCode();
        if (generatedCode == null || generatedCode.trim().isEmpty()) {
            generatedCode = "OFF-" + System.currentTimeMillis() % 1000000;
        }

        EmploymentOfferEntityClass entity = EmploymentOfferEntityClass.builder()
                .offerCode(generatedCode)
                .documentType(request.getDocumentType() != null ? request.getDocumentType() : EmploymentOfferCON.DOC_TYPE_OFFER_LETTER)
                .signatureCount(request.getSignatureCount() != null ? request.getSignatureCount() : 2)
                .candidateName(request.getCandidateName().trim())
                .candidateEmail(request.getCandidateEmail().trim())
                .candidatePhone(request.getCandidatePhone())
                .designation(request.getDesignation().trim())
                .department(request.getDepartment())
                .employmentType(request.getEmploymentType() != null ? request.getEmploymentType() : "Full-Time")
                .workLocation(request.getWorkLocation())
                .joiningDate(request.getJoiningDate())
                .expiryDate(request.getExpiryDate())
                .reportingManagerName(request.getReportingManagerName())
                .reportingManagerTitle(request.getReportingManagerTitle())
                .companyName(request.getCompanyName() != null ? request.getCompanyName() : "We.PLM Global Technologies (P) Ltd.")
                .companyAddress(request.getCompanyAddress())
                .companyCin(request.getCompanyCin())
                .baseSalary(request.getBaseSalary())
                .variablePay(request.getVariablePay())
                .joiningBonus(request.getJoiningBonus())
                .stockOptions(request.getStockOptions())
                .totalCtc(request.getTotalCtc())
                .annualCtc(request.getAnnualCtc())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .probationPeriodMonths(request.getProbationPeriodMonths())
                .noticePeriodDays(request.getNoticePeriodDays())
                .relocationAllowance(request.getRelocationAllowance())
                .benefitsDetails(request.getBenefitsDetails())
                .status(EmploymentOfferCON.STATUS_AWAITING_CANDIDATE)
                .offerLetterHtml(request.getOfferLetterHtml())
                .generatedCandidateUrl(request.getGeneratedCandidateUrl())
                .documentHash(request.getDocumentHash())
                .auditTrailJson(request.getAuditTrailJson() != null ? request.getAuditTrailJson() : createInitialAuditLog(currentUserName))
                .createdById(currentUserId)
                .createdByName(currentUserName)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        EmploymentOfferEntityClass saved = employmentOfferRepository.save(entity);
        log.info("Successfully persisted employment offer ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmploymentOfferResponseDTO> getAllEmploymentOffers() {
        return employmentOfferRepository.findAllByStatusNotOrderByCreatedAtDesc(EmploymentOfferCON.STATUS_CANCELLED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmploymentOfferResponseDTO getEmploymentOfferById(UUID offerId) {
        Optional<EmploymentOfferEntityClass> offerOpt = employmentOfferRepository.findById(offerId);
        EmploymentOfferEntityClass offer = EmploymentOfferAssertion.getCurrent().assertOfferExists(offerOpt, offerId);
        return mapToResponse(offer);
    }

    @Override
    @Transactional
    public EmploymentOfferResponseDTO candidateSign(CandidateSignRequestDTO request) {
        log.info("Processing candidate signature for offer ID: {}", request.getOfferId());
        Optional<EmploymentOfferEntityClass> offerOpt = employmentOfferRepository.findById(request.getOfferId());
        EmploymentOfferEntityClass offer = EmploymentOfferAssertion.getCurrent().assertOfferExists(offerOpt, request.getOfferId());

        EmploymentOfferAssertion.getCurrent().assertCanCandidateSign(offer);

        offer.setCandidateSignedAt(Instant.now());
        offer.setCandidateSignMode(request.getSignMode() != null ? request.getSignMode() : EmploymentOfferCON.SIGN_MODE_DRAW);
        offer.setCandidateSignatureData(request.getSignatureData());
        offer.setCandidateSignIp(request.getIpAddress());
        offer.setCandidateSignUserAgent(request.getUserAgent());
        offer.setStatus(EmploymentOfferCON.STATUS_AWAITING_COUNTERSIGN);

        if (request.getUpdatedHtml() != null && !request.getUpdatedHtml().trim().isEmpty()) {
            offer.setOfferLetterHtml(request.getUpdatedHtml());
        }

        offer.setAuditTrailJson(appendAuditEvent(offer.getAuditTrailJson(), "CANDIDATE_SIGNED", 
                "Offer signed electronically by candidate " + offer.getCandidateName()));
        offer.setUpdatedAt(Instant.now());

        EmploymentOfferEntityClass saved = employmentOfferRepository.save(offer);
        log.info("Candidate signature applied to offer ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmploymentOfferResponseDTO counterSign(CounterSignRequestDTO request, UUID currentUserId, String currentUserName) {
        log.info("Processing HR countersign for offer ID: {} by user: {}", request.getOfferId(), currentUserName);
        Optional<EmploymentOfferEntityClass> offerOpt = employmentOfferRepository.findById(request.getOfferId());
        EmploymentOfferEntityClass offer = EmploymentOfferAssertion.getCurrent().assertOfferExists(offerOpt, request.getOfferId());

        EmploymentOfferAssertion.getCurrent().assertCanCounterSign(offer);

        offer.setCounterSignedAt(Instant.now());
        offer.setCounterSignedByUserId(currentUserId);
        offer.setCounterSignedByUserName(currentUserName);
        offer.setCounterSignMode(request.getSignMode() != null ? request.getSignMode() : EmploymentOfferCON.SIGN_MODE_DRAW);
        offer.setCounterSignatureData(request.getSignatureData());

        if (request.getUpdatedHtml() != null && !request.getUpdatedHtml().trim().isEmpty()) {
            offer.setOfferLetterHtml(request.getUpdatedHtml());
        }

        // Determine next status based on signature count
        if (offer.getSignatureCount() != null && offer.getSignatureCount() == 3) {
            offer.setStatus(EmploymentOfferCON.STATUS_AWAITING_THIRD_PARTY_SIGN);
        } else {
            offer.setStatus(EmploymentOfferCON.STATUS_FULLY_EXECUTED);
        }

        offer.setAuditTrailJson(appendAuditEvent(offer.getAuditTrailJson(), "HR_COUNTERSIGNED",
                "Offer countersigned by HR Manager " + currentUserName));
        offer.setUpdatedAt(Instant.now());

        EmploymentOfferEntityClass saved = employmentOfferRepository.save(offer);
        log.info("HR Countersignature applied to offer ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmploymentOfferResponseDTO thirdPartySign(ThirdPartySignRequestDTO request, UUID currentUserId, String currentUserName) {
        log.info("Processing 3rd party executive sign for offer ID: {} by user: {}", request.getOfferId(), currentUserName);
        Optional<EmploymentOfferEntityClass> offerOpt = employmentOfferRepository.findById(request.getOfferId());
        EmploymentOfferEntityClass offer = EmploymentOfferAssertion.getCurrent().assertOfferExists(offerOpt, request.getOfferId());

        EmploymentOfferAssertion.getCurrent().assertCanThirdPartySign(offer);

        offer.setThirdPartySignedAt(Instant.now());
        offer.setThirdPartySignedByUserId(currentUserId);
        offer.setThirdPartySignedByUserName(currentUserName);
        offer.setThirdPartySignMode(request.getSignMode() != null ? request.getSignMode() : EmploymentOfferCON.SIGN_MODE_DRAW);
        offer.setThirdPartySignatureData(request.getSignatureData());

        if (request.getUpdatedHtml() != null && !request.getUpdatedHtml().trim().isEmpty()) {
            offer.setOfferLetterHtml(request.getUpdatedHtml());
        }

        offer.setStatus(EmploymentOfferCON.STATUS_FULLY_EXECUTED);
        offer.setAuditTrailJson(appendAuditEvent(offer.getAuditTrailJson(), "THIRD_PARTY_SIGNED",
                "Offer approved and signed by Executive Signatory " + currentUserName));
        offer.setUpdatedAt(Instant.now());

        EmploymentOfferEntityClass saved = employmentOfferRepository.save(offer);
        log.info("3rd party executive signature applied to offer ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteEmploymentOffer(UUID offerId) {
        log.info("Soft deleting employment offer ID: {}", offerId);
        Optional<EmploymentOfferEntityClass> offerOpt = employmentOfferRepository.findById(offerId);
        EmploymentOfferEntityClass offer = EmploymentOfferAssertion.getCurrent().assertOfferExists(offerOpt, offerId);

        offer.setStatus(EmploymentOfferCON.STATUS_CANCELLED);
        offer.setAuditTrailJson(appendAuditEvent(offer.getAuditTrailJson(), "OFFER_CANCELLED", "Offer cancelled and archived."));
        offer.setUpdatedAt(Instant.now());
        employmentOfferRepository.save(offer);
    }

    private String createInitialAuditLog(String creatorName) {
        try {
            List<Map<String, Object>> list = new ArrayList<>();
            Map<String, Object> event = new HashMap<>();
            event.put("action", "OFFER_CREATED");
            event.put("details", "Offer package generated and dispatched by " + (creatorName != null ? creatorName : "System"));
            event.put("timestamp", Instant.now().toString());
            list.add(event);
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String appendAuditEvent(String existingAuditJson, String action, String details) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> list = existingAuditJson != null && !existingAuditJson.trim().isEmpty()
                    ? MAPPER.readValue(existingAuditJson, List.class)
                    : new ArrayList<>();
            Map<String, Object> event = new HashMap<>();
            event.put("action", action);
            event.put("details", details);
            event.put("timestamp", Instant.now().toString());
            list.add(event);
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return existingAuditJson;
        }
    }

    private EmploymentOfferResponseDTO mapToResponse(EmploymentOfferEntityClass entity) {
        return EmploymentOfferResponseDTO.builder()
                .id(entity.getId())
                .offerCode(entity.getOfferCode())
                .documentType(entity.getDocumentType())
                .signatureCount(entity.getSignatureCount())
                .candidateName(entity.getCandidateName())
                .candidateEmail(entity.getCandidateEmail())
                .candidatePhone(entity.getCandidatePhone())
                .designation(entity.getDesignation())
                .department(entity.getDepartment())
                .employmentType(entity.getEmploymentType())
                .workLocation(entity.getWorkLocation())
                .joiningDate(entity.getJoiningDate())
                .expiryDate(entity.getExpiryDate())
                .reportingManagerName(entity.getReportingManagerName())
                .reportingManagerTitle(entity.getReportingManagerTitle())
                .companyName(entity.getCompanyName())
                .companyAddress(entity.getCompanyAddress())
                .companyCin(entity.getCompanyCin())
                .baseSalary(entity.getBaseSalary())
                .variablePay(entity.getVariablePay())
                .joiningBonus(entity.getJoiningBonus())
                .stockOptions(entity.getStockOptions())
                .totalCtc(entity.getTotalCtc())
                .annualCtc(entity.getAnnualCtc())
                .currency(entity.getCurrency())
                .probationPeriodMonths(entity.getProbationPeriodMonths())
                .noticePeriodDays(entity.getNoticePeriodDays())
                .relocationAllowance(entity.getRelocationAllowance())
                .benefitsDetails(entity.getBenefitsDetails())
                .status(entity.getStatus())
                .candidateSignedAt(entity.getCandidateSignedAt())
                .candidateSignMode(entity.getCandidateSignMode())
                .candidateSignatureData(entity.getCandidateSignatureData())
                .candidateSignIp(entity.getCandidateSignIp())
                .candidateSignUserAgent(entity.getCandidateSignUserAgent())
                .counterSignedAt(entity.getCounterSignedAt())
                .counterSignedByUserId(entity.getCounterSignedByUserId())
                .counterSignedByUserName(entity.getCounterSignedByUserName())
                .counterSignMode(entity.getCounterSignMode())
                .counterSignatureData(entity.getCounterSignatureData())
                .thirdPartySignedAt(entity.getThirdPartySignedAt())
                .thirdPartySignedByUserId(entity.getThirdPartySignedByUserId())
                .thirdPartySignedByUserName(entity.getThirdPartySignedByUserName())
                .thirdPartySignMode(entity.getThirdPartySignMode())
                .thirdPartySignatureData(entity.getThirdPartySignatureData())
                .offerLetterHtml(entity.getOfferLetterHtml())
                .generatedCandidateUrl(entity.getGeneratedCandidateUrl())
                .generatedCountersignUrl(entity.getGeneratedCountersignUrl())
                .generatedThirdPartyUrl(entity.getGeneratedThirdPartyUrl())
                .documentHash(entity.getDocumentHash())
                .auditTrailJson(entity.getAuditTrailJson())
                .createdById(entity.getCreatedById())
                .createdByName(entity.getCreatedByName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
