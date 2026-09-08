package com.theweplm.signforge.Features.ConfigurationConstant;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.AddDepartmentRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.AddDesignationRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.AddWorkLocationRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.ConfigurationConstantResponseDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.UpdateConfigurationConstantRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Services.IConfigurationConstantService;
import com.theweplm.signforge.Helpers.JwtTokenHelper;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.CONTROLLER_URL)
public final class ConfigurationConstantController {

    private final IConfigurationConstantService configurationConstantService;

    @GetMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.GET_ALL)
    public ResponseEntity<ApiResponseClass<List<ConfigurationConstantResponseDTO>>> getAllConfigurations() {
        try {
            List<ConfigurationConstantResponseDTO> list = configurationConstantService.getAllActiveConfigurations();
            return ResponseEntity.ok(ApiResponseClass.succeeded(list, "Active configuration constants retrieved successfully.", 200));
        } catch (Exception ex) {
            log.error("Error retrieving configuration constants", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to retrieve configuration constants.", Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.GET_BY_KEY)
    public ResponseEntity<ApiResponseClass<ConfigurationConstantResponseDTO>> getConfigurationByKey(
            @PathVariable("key") String key) {
        try {
            ConfigurationConstantResponseDTO response = configurationConstantService.getConfigurationByKey(key);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Configuration constant retrieved successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Get configuration constant warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Error retrieving configuration constant by key: {}", key, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to retrieve configuration constant.", Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PutMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.UPDATE)
    public ResponseEntity<ApiResponseClass<ConfigurationConstantResponseDTO>> updateConfiguration(
            @PathVariable("key") String key,
            @Valid @RequestBody UpdateConfigurationConstantRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String updatedBy = extractCallerName(authHeader);
            ConfigurationConstantResponseDTO response = configurationConstantService.updateConfiguration(key, request, updatedBy);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Configuration constant updated successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Update configuration constant warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Error updating configuration constant: {}", key, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to update configuration constant.", Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.ADD_DESIGNATION)
    public ResponseEntity<ApiResponseClass<ConfigurationConstantResponseDTO>> addDesignation(
            @Valid @RequestBody AddDesignationRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String updatedBy = extractCallerName(authHeader);
            ConfigurationConstantResponseDTO response = configurationConstantService.addDesignation(request, updatedBy);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Designation added successfully in AssetSphere configuration.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Add designation validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Error adding designation to AssetSphere configuration", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to add designation.", Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.ADD_DEPARTMENT)
    public ResponseEntity<ApiResponseClass<ConfigurationConstantResponseDTO>> addDepartment(
            @Valid @RequestBody AddDepartmentRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String updatedBy = extractCallerName(authHeader);
            ConfigurationConstantResponseDTO response = configurationConstantService.addDepartment(request, updatedBy);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Department added successfully in AssetSphere configuration.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Add department validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Error adding department to AssetSphere configuration", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to add department.", Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.ConfigurationConstantRoutes.ADD_WORK_LOCATION)
    public ResponseEntity<ApiResponseClass<ConfigurationConstantResponseDTO>> addWorkLocation(
            @Valid @RequestBody AddWorkLocationRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String updatedBy = extractCallerName(authHeader);
            ConfigurationConstantResponseDTO response = configurationConstantService.addWorkLocation(request, updatedBy);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Work location added successfully in AssetSphere configuration.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Add work location validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Error adding work location to AssetSphere configuration", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to add work location.", Collections.singletonList(ex.getMessage()), 500));
        }
    }

    private String extractCallerName(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Map<String, Object> claims = JwtTokenHelper.getCurrent().validateAndExtractClaims(authHeader);
                if (claims != null && claims.get("name") != null) {
                    return claims.get("name").toString();
                } else if (claims != null && claims.get("sub") != null) {
                    return claims.get("sub").toString();
                }
            } catch (Exception ignored) {}
        }
        return "SYSTEM_ADMIN";
    }
}
