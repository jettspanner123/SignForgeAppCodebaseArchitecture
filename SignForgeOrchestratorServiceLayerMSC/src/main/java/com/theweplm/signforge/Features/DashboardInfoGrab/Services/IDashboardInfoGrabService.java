package com.theweplm.signforge.Features.DashboardInfoGrab.Services;

import com.theweplm.signforge.Features.DashboardInfoGrab.Models.DashboardInfoGrabResponseDTO;

import java.util.UUID;

public interface IDashboardInfoGrabService {

    DashboardInfoGrabResponseDTO getDashboardData(UUID currentUserId, String userRole);
}
