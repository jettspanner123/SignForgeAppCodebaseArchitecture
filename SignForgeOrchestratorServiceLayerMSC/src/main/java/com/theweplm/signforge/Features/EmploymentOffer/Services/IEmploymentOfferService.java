package com.theweplm.signforge.Features.EmploymentOffer.Services;

import com.theweplm.signforge.Features.EmploymentOffer.Models.CandidateSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CounterSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CreateEmploymentOfferRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.EmploymentOfferResponseDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.ThirdPartySignRequestDTO;

import java.util.List;
import java.util.UUID;

public interface IEmploymentOfferService {

    EmploymentOfferResponseDTO createEmploymentOffer(CreateEmploymentOfferRequestDTO request, UUID currentUserId, String currentUserName);

    List<EmploymentOfferResponseDTO> getAllEmploymentOffers();

    EmploymentOfferResponseDTO getEmploymentOfferById(UUID offerId);

    EmploymentOfferResponseDTO candidateSign(CandidateSignRequestDTO request);

    EmploymentOfferResponseDTO counterSign(CounterSignRequestDTO request, UUID currentUserId, String currentUserName);

    EmploymentOfferResponseDTO thirdPartySign(ThirdPartySignRequestDTO request, UUID currentUserId, String currentUserName);

    void deleteEmploymentOffer(UUID offerId);
}
