package com.theweplm.signforge.Features.DashboardInfoGrab.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theweplm.signforge.Features.DashboardInfoGrab.Models.DashboardActivityDTO;
import com.theweplm.signforge.Features.DashboardInfoGrab.Models.DashboardInfoGrabResponseDTO;
import com.theweplm.signforge.Features.DashboardInfoGrab.Models.DashboardKpiMetricsDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Constants.EmploymentOfferCON;
import com.theweplm.signforge.Features.EmploymentOffer.Models.EmploymentOfferResponseDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Services.IEmploymentOfferService;
import com.theweplm.signforge.Models.Classes.EmploymentOfferEntityClass;
import com.theweplm.signforge.Repositories.IEmploymentOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardInfoGrabService implements IDashboardInfoGrabService {

    private final IEmploymentOfferRepository employmentOfferRepository;
    private final IEmploymentOfferService employmentOfferService;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public DashboardInfoGrabResponseDTO getDashboardData(UUID currentUserId, String userRole) {
        log.info("Fetching dashboard info grab for user: {} with role: {}", currentUserId, userRole);

        List<EmploymentOfferEntityClass> allOffers = employmentOfferRepository.findAllByOrderByCreatedAtDesc();
        List<EmploymentOfferResponseDTO> offerDtos = employmentOfferService.getAllEmploymentOffers();

        long totalPipeline = 0;
        long awaitingCandidate = 0;
        long awaitingCountersign = 0;
        long awaitingThirdPartySign = 0;
        long fullyExecuted = 0;
        long drafts = 0;
        long cancelled = 0;
        long expired = 0;
        BigDecimal totalCompensation = BigDecimal.ZERO;

        List<DashboardActivityDTO> activities = new ArrayList<>();

        for (EmploymentOfferEntityClass offer : allOffers) {
            String status = offer.getStatus() != null ? offer.getStatus() : EmploymentOfferCON.STATUS_AWAITING_CANDIDATE;

            if (EmploymentOfferCON.STATUS_CANCELLED.equalsIgnoreCase(status)) {
                cancelled++;
            } else if (EmploymentOfferCON.STATUS_EXPIRED.equalsIgnoreCase(status)) {
                expired++;
            } else {
                totalPipeline++;

                if (EmploymentOfferCON.STATUS_AWAITING_CANDIDATE.equalsIgnoreCase(status) || "SENT".equalsIgnoreCase(status)) {
                    awaitingCandidate++;
                } else if (EmploymentOfferCON.STATUS_AWAITING_COUNTERSIGN.equalsIgnoreCase(status) || "CANDIDATE_SIGNED".equalsIgnoreCase(status)) {
                    awaitingCountersign++;
                } else if (EmploymentOfferCON.STATUS_AWAITING_THIRD_PARTY_SIGN.equalsIgnoreCase(status)) {
                    awaitingThirdPartySign++;
                } else if (EmploymentOfferCON.STATUS_FULLY_EXECUTED.equalsIgnoreCase(status) || "HR_COUNTERSIGNED".equalsIgnoreCase(status)) {
                    fullyExecuted++;
                } else if (EmploymentOfferCON.STATUS_DRAFT.equalsIgnoreCase(status)) {
                    drafts++;
                }

                if (offer.getTotalCtc() != null) {
                    totalCompensation = totalCompensation.add(offer.getTotalCtc());
                } else if (offer.getAnnualCtc() != null) {
                    totalCompensation = totalCompensation.add(offer.getAnnualCtc());
                }
            }

            // Parse audit trail events into recent activity feed
            extractAuditActivities(offer, activities);
        }

        // Sort activities by timestamp desc and take top 20
        activities.sort(Comparator.comparing(DashboardActivityDTO::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        if (activities.size() > 20) {
            activities = activities.subList(0, 20);
        }

        double executionRate = totalPipeline > 0 ? ((double) fullyExecuted / totalPipeline) * 100.0 : 0.0;

        DashboardKpiMetricsDTO metrics = DashboardKpiMetricsDTO.builder()
                .totalPipeline(totalPipeline)
                .awaitingCandidate(awaitingCandidate)
                .awaitingCountersign(awaitingCountersign)
                .awaitingThirdPartySign(awaitingThirdPartySign)
                .fullyExecuted(fullyExecuted)
                .drafts(drafts)
                .cancelled(cancelled)
                .expired(expired)
                .totalCompensationValue(totalCompensation)
                .executionRatePercentage(Math.round(executionRate * 10.0) / 10.0)
                .build();

        return DashboardInfoGrabResponseDTO.builder()
                .metrics(metrics)
                .recentActivities(activities)
                .offers(offerDtos)
                .build();
    }

    private void extractAuditActivities(EmploymentOfferEntityClass offer, List<DashboardActivityDTO> activities) {
        String auditJson = offer.getAuditTrailJson();
        if (auditJson == null || auditJson.trim().isEmpty()) {
            return;
        }

        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> events = MAPPER.readValue(auditJson, List.class);
            for (Map<String, Object> event : events) {
                String action = event.get("action") != null ? event.get("action").toString() : "UPDATED";
                String details = event.get("details") != null ? event.get("details").toString() : "";
                String timestamp = event.get("timestamp") != null ? event.get("timestamp").toString() : offer.getCreatedAt().toString();
                String actor = event.get("actor") != null ? event.get("actor").toString() : (event.get("actorName") != null ? event.get("actorName").toString() : "System");
                String role = event.get("actorRole") != null ? event.get("actorRole").toString() : "HR";
                String eventId = event.get("id") != null ? event.get("id").toString() : UUID.randomUUID().toString();

                activities.add(DashboardActivityDTO.builder()
                        .id(eventId)
                        .offerId(offer.getId())
                        .offerCode(offer.getOfferCode())
                        .candidateName(offer.getCandidateName())
                        .designation(offer.getDesignation())
                        .action(action)
                        .details(details)
                        .timestamp(timestamp)
                        .actorName(actor)
                        .actorRole(role)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to parse audit log for offer {}: {}", offer.getId(), e.getMessage());
        }
    }
}
