package com.theweplm.signforge.Features.Authentication.Services;

import com.theweplm.signforge.Exceptions.ResourceNotFoundCException;
import com.theweplm.signforge.Features.Authentication.Models.UserSummaryDTO;
import com.theweplm.signforge.Models.Classes.UserEntityClass;
import com.theweplm.signforge.Repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getActiveUsers() {
        log.info("Fetching all active users for selection");
        return userRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDTO getUserById(UUID userId) {
        log.info("Fetching user details by ID: {}", userId);
        UserEntityClass user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundCException("User not found with ID: " + userId));
        return mapToSummaryDTO(user);
    }

    private UserSummaryDTO mapToSummaryDTO(UserEntityClass user) {
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
