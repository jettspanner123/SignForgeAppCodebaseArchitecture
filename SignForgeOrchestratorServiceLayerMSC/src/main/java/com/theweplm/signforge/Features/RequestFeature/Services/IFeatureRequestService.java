package com.theweplm.signforge.Features.RequestFeature.Services;

import com.theweplm.signforge.Features.RequestFeature.Models.CreateFeatureRequestRequestDTO;
import com.theweplm.signforge.Features.RequestFeature.Models.FeatureRequestDTO;

import java.util.List;
import java.util.UUID;

public interface IFeatureRequestService {
    FeatureRequestDTO createFeatureRequest(CreateFeatureRequestRequestDTO request, UUID requesterUserId, String requesterEmail);
    List<FeatureRequestDTO> getAllFeatureRequests();
    FeatureRequestDTO getFeatureRequestById(UUID id);
}
