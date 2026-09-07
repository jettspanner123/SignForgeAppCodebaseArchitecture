package com.theweplm.signforge.Features.RequestFeature.Services;

import com.theweplm.signforge.Constants.FeatureRequestStatus;
import com.theweplm.signforge.Exceptions.ResourceNotFoundCException;
import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.Authentication.Models.UserSummaryDTO;
import com.theweplm.signforge.Features.RequestFeature.Models.CreateFeatureRequestRequestDTO;
import com.theweplm.signforge.Features.RequestFeature.Models.FeatureRequestDTO;
import com.theweplm.signforge.Models.Classes.FeatureRequestEntityClass;
import com.theweplm.signforge.Models.Classes.UserEntityClass;
import com.theweplm.signforge.Repositories.IFeatureRequestRepository;
import com.theweplm.signforge.Repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeatureRequestService implements IFeatureRequestService {

    private final IFeatureRequestRepository featureRequestRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional
    public FeatureRequestDTO createFeatureRequest(CreateFeatureRequestRequestDTO request, UUID requesterUserId, String requesterEmail) {
        log.info("Creating feature request for target user: {} by requester: {}", request.getTargetUserId(), requesterUserId);

        UserEntityClass targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new ValidationCException("Target user account not found with ID: " + request.getTargetUserId()));

        UserEntityClass requesterUser = userRepository.findById(requesterUserId)
                .orElseThrow(() -> new ValidationCException("Requester user account not found with ID: " + requesterUserId));

        String createdBy = (requesterEmail != null && !requesterEmail.isBlank())
                ? requesterEmail.trim().toUpperCase(Locale.ROOT)
                : (requesterUser.getEmail() != null ? requesterUser.getEmail().toUpperCase(Locale.ROOT) : "USER");

        FeatureRequestEntityClass entity = FeatureRequestEntityClass.builder()
                .requesterUserId(requesterUserId)
                .targetUserId(request.getTargetUserId())
                .title(request.getTitle().trim())
                .featureType(request.getFeatureType().trim())
                .description(request.getDescription().trim())
                .status(FeatureRequestStatus.PENDING.name())
                .createdBy(createdBy)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        FeatureRequestEntityClass savedEntity = featureRequestRepository.save(entity);
        log.info("Feature request created successfully with ID: {}", savedEntity.getId());

        return mapToDTO(savedEntity, requesterUser, targetUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeatureRequestDTO> getAllFeatureRequests() {
        log.info("Fetching all feature requests");
        return featureRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTOWithUserLookups)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FeatureRequestDTO getFeatureRequestById(UUID id) {
        log.info("Fetching feature request by ID: {}", id);
        FeatureRequestEntityClass entity = featureRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundCException("Feature request not found with ID: " + id));
        return mapToDTOWithUserLookups(entity);
    }

    private FeatureRequestDTO mapToDTOWithUserLookups(FeatureRequestEntityClass entity) {
        UserEntityClass requesterUser = userRepository.findById(entity.getRequesterUserId()).orElse(null);
        UserEntityClass targetUser = userRepository.findById(entity.getTargetUserId()).orElse(null);
        return mapToDTO(entity, requesterUser, targetUser);
    }

    private FeatureRequestDTO mapToDTO(FeatureRequestEntityClass entity, UserEntityClass requesterUser, UserEntityClass targetUser) {
        return FeatureRequestDTO.builder()
                .id(entity.getId())
                .requesterUserId(entity.getRequesterUserId())
                .requesterUser(requesterUser != null ? mapUserToSummary(requesterUser) : null)
                .targetUserId(entity.getTargetUserId())
                .targetUser(targetUser != null ? mapUserToSummary(targetUser) : null)
                .title(entity.getTitle())
                .featureType(entity.getFeatureType())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private UserSummaryDTO mapUserToSummary(UserEntityClass user) {
        return UserSummaryDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
