package com.theweplm.signforge.Features.Authentication.Services;

import com.theweplm.signforge.Features.Authentication.Models.UserSummaryDTO;

import java.util.List;
import java.util.UUID;

public interface IUserService {
    List<UserSummaryDTO> getActiveUsers();
    UserSummaryDTO getUserById(UUID userId);
}
