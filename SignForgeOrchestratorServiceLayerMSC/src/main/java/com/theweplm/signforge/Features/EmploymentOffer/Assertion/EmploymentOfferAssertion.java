package com.theweplm.signforge.Features.EmploymentOffer.Assertion;

import com.theweplm.signforge.Constants.UserRoleType;
import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.EmploymentOffer.Constants.EmploymentOfferCON;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CandidateSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CounterSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CreateEmploymentOfferRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.ThirdPartySignRequestDTO;
import com.theweplm.signforge.Models.Classes.EmploymentOfferEntityClass;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Feature Assertion Singleton for Employment Offer Request Validations.
 */
public final class EmploymentOfferAssertion {

    private static final EmploymentOfferAssertion CURRENT = new EmploymentOfferAssertion();

    public static EmploymentOfferAssertion getCurrent() {
        return CURRENT;
    }

    private EmploymentOfferAssertion() {}

    public <T> void checkForNullRequest(T request, String errorMessage) {
        if (request == null) {
            throw new ValidationCException(errorMessage != null ? errorMessage : "Request body cannot be empty.");
        }
    }

    public <T> void checkForNullRequest(T request) {
        checkForNullRequest(request, "Request body cannot be empty.");
    }

    public void assertCreateRequest(CreateEmploymentOfferRequestDTO request) {
        checkForNullRequest(request, "Create employment offer request body cannot be empty.");

        List<String> errors = new ArrayList<>();
        if (request.getCandidateName() == null || request.getCandidateName().trim().isEmpty()) {
            errors.add("Candidate name is required.");
        }
        if (request.getCandidateEmail() == null || request.getCandidateEmail().trim().isEmpty()) {
            errors.add("Candidate email is required.");
        }
        if (request.getDesignation() == null || request.getDesignation().trim().isEmpty()) {
            errors.add("Designation / Role title is required.");
        }
        if (request.getJoiningDate() == null || request.getJoiningDate().trim().isEmpty()) {
            errors.add("Joining date is required.");
        }

        if (!errors.isEmpty()) {
            throw new ValidationCException(errors);
        }
    }

    public void assertCandidateSignRequest(CandidateSignRequestDTO request) {
        checkForNullRequest(request, "Candidate signature request body cannot be empty.");

        List<String> errors = new ArrayList<>();
        if (request.getOfferId() == null) {
            errors.add("Offer ID is required for candidate signature.");
        }
        if (request.getSignatureData() == null || request.getSignatureData().trim().isEmpty()) {
            errors.add("Signature data / payload is required.");
        }

        if (!errors.isEmpty()) {
            throw new ValidationCException(errors);
        }
    }

    public void assertCounterSignRequest(CounterSignRequestDTO request) {
        checkForNullRequest(request, "Countersign request body cannot be empty.");

        List<String> errors = new ArrayList<>();
        if (request.getOfferId() == null) {
            errors.add("Offer ID is required for countersignature.");
        }
        if (request.getSignatureData() == null || request.getSignatureData().trim().isEmpty()) {
            errors.add("Signature data is required.");
        }

        if (!errors.isEmpty()) {
            throw new ValidationCException(errors);
        }
    }

    public void assertThirdPartySignRequest(ThirdPartySignRequestDTO request) {
        checkForNullRequest(request, "Third-party signature request body cannot be empty.");

        List<String> errors = new ArrayList<>();
        if (request.getOfferId() == null) {
            errors.add("Offer ID is required for third-party signature.");
        }
        if (request.getSignatureData() == null || request.getSignatureData().trim().isEmpty()) {
            errors.add("Signature data is required.");
        }

        if (!errors.isEmpty()) {
            throw new ValidationCException(errors);
        }
    }

    public EmploymentOfferEntityClass assertOfferExists(Optional<EmploymentOfferEntityClass> offerOpt, UUID offerId) {
        if (offerOpt.isEmpty()) {
            throw new ValidationCException("Employment offer not found with ID: " + offerId);
        }
        return offerOpt.get();
    }

    public void assertCanCandidateSign(EmploymentOfferEntityClass offer) {
        if (EmploymentOfferCON.STATUS_CANCELLED.equalsIgnoreCase(offer.getStatus())) {
            throw new ValidationCException("Cannot sign a cancelled employment offer.");
        }
        if (offer.getCandidateSignedAt() != null) {
            throw new ValidationCException("Candidate signature has already been applied to this offer.");
        }
    }

    public void assertCanCounterSign(EmploymentOfferEntityClass offer) {
        if (EmploymentOfferCON.STATUS_CANCELLED.equalsIgnoreCase(offer.getStatus())) {
            throw new ValidationCException("Cannot countersign a cancelled employment offer.");
        }
        if (offer.getCandidateSignedAt() == null) {
            throw new ValidationCException("Candidate must sign the offer before HR countersignature can be performed.");
        }
        if (offer.getCounterSignedAt() != null) {
            throw new ValidationCException("HR Countersignature has already been applied to this offer.");
        }
    }

    public void assertCanThirdPartySign(EmploymentOfferEntityClass offer) {
        if (EmploymentOfferCON.STATUS_CANCELLED.equalsIgnoreCase(offer.getStatus())) {
            throw new ValidationCException("Cannot sign a cancelled employment offer.");
        }
        if (offer.getCounterSignedAt() == null) {
            throw new ValidationCException("HR Countersignature is required prior to third-party signature.");
        }
        if (offer.getThirdPartySignedAt() != null) {
            throw new ValidationCException("Third-party signature has already been applied to this offer.");
        }
    }

    public void assertRoleAuthorizedForCounterSign(String role) {
        if (role == null) {
            throw new ValidationCException("Unauthorized: missing user role claim.");
        }
        boolean isAuthorized = UserRoleType.HR_MANAGER.equalsIgnoreCase(role)
                || UserRoleType.ADMIN.equalsIgnoreCase(role)
                || UserRoleType.EXECUTIVE_DIRECTOR.equalsIgnoreCase(role);
        if (!isAuthorized) {
            throw new ValidationCException("Access denied: HR Countersignature requires HR_MANAGER or higher role.");
        }
    }

    public void assertRoleAuthorizedForThirdParty(String role) {
        if (role == null) {
            throw new ValidationCException("Unauthorized: missing user role claim.");
        }
        boolean isAuthorized = UserRoleType.ADMIN.equalsIgnoreCase(role)
                || UserRoleType.EXECUTIVE_DIRECTOR.equalsIgnoreCase(role);
        if (!isAuthorized) {
            throw new ValidationCException("Access denied: Third-party executive approval requires ADMIN or EXECUTIVE_DIRECTOR role.");
        }
    }

    public UUID assertValidUuid(String uuidString, String fieldName) {
        if (uuidString == null || uuidString.trim().isEmpty()) {
            throw new ValidationCException(fieldName + " is required.");
        }
        try {
            return UUID.fromString(uuidString.trim());
        } catch (IllegalArgumentException e) {
            throw new ValidationCException(fieldName + " must be a valid UUID.");
        }
    }
}
