package com.theweplm.signforge.Features.Authentication;

import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.Authentication.Models.UserSummaryDTO;
import com.theweplm.signforge.Features.Authentication.Services.IUserService;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApplicationRouteFactory.UserRoutes.CONTROLLER_URL)
public final class UserController {

    private final IUserService userService;

    @GetMapping(ApplicationRouteFactory.UserRoutes.GET_ALL)
    public ResponseEntity<ApiResponseClass<List<UserSummaryDTO>>> getActiveUsers() {
        try {
            List<UserSummaryDTO> users = userService.getActiveUsers();
            return ResponseEntity.ok(ApiResponseClass.succeeded(users, "Active users retrieved successfully.", 200));
        } catch (Exception ex) {
            log.error("Error retrieving active users", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to retrieve active users.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.UserRoutes.GET_BY_ID)
    public ResponseEntity<ApiResponseClass<UserSummaryDTO>> getUserById(@PathVariable("id") UUID id) {
        try {
            UserSummaryDTO user = userService.getUserById(id);
            return ResponseEntity.ok(ApiResponseClass.succeeded(user, "User details retrieved successfully.", 200));
        } catch (Exception ex) {
            log.error("Error retrieving user with ID: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to retrieve user.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }
}
