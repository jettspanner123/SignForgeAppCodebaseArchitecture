package com.theweplm.signforge.Features.ConfigurationConstant.Services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.AddDepartmentRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.AddDesignationRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.AddWorkLocationRequestDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.ConfigurationConstantResponseDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.UpdateConfigurationConstantRequestDTO;
import com.theweplm.signforge.Models.Classes.ConfigurationConstantEntityClass;
import com.theweplm.signforge.Repositories.IConfigurationConstantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ConfigurationConstantService implements IConfigurationConstantService {

    private final IConfigurationConstantRepository configurationRepository;
    private final JdbcTemplate assetSphereJdbcTemplate;
    private final ObjectMapper objectMapper;

    public ConfigurationConstantService(
            IConfigurationConstantRepository configurationRepository,
            @Qualifier("assetSphereJdbcTemplate") JdbcTemplate assetSphereJdbcTemplate,
            ObjectMapper objectMapper) {
        this.configurationRepository = configurationRepository;
        this.assetSphereJdbcTemplate = assetSphereJdbcTemplate;
        this.objectMapper = objectMapper;
    }

    private static final RowMapper<ConfigurationConstantResponseDTO> ASSETSPHERE_ROW_MAPPER = (rs, rowNum) -> {
        UUID id = null;
        try {
            Object idObj = rs.getObject("id");
            if (idObj instanceof UUID) {
                id = (UUID) idObj;
            } else if (idObj != null) {
                id = UUID.fromString(idObj.toString());
            }
        } catch (Exception ignored) {}

        Timestamp createdAtTs = rs.getTimestamp("created_at");
        Timestamp updatedAtTs = rs.getTimestamp("updated_at");

        return ConfigurationConstantResponseDTO.builder()
                .id(id)
                .configurationKey(rs.getString("configuration_key"))
                .configurationValue(rs.getString("configuration_value"))
                .description(rs.getString("notes"))
                .isActive(!rs.getBoolean("is_deleted"))
                .createdBy(rs.getString("created_by"))
                .updatedBy(rs.getString("updated_by"))
                .createdAt(createdAtTs != null ? createdAtTs.toInstant() : Instant.now())
                .updatedAt(updatedAtTs != null ? updatedAtTs.toInstant() : null)
                .build();
    };

    @Override
    public List<ConfigurationConstantResponseDTO> getAllActiveConfigurations() {
        List<ConfigurationConstantResponseDTO> results = new ArrayList<>();

        // 1. Fetch live AssetSphere constants
        try {
            String sql = "SELECT id, configuration_key, configuration_value, notes, is_deleted, created_by, updated_by, created_at, updated_at " +
                    "FROM \"AS_ConfigurationConstantTBL\" " +
                    "WHERE is_deleted = false OR is_deleted IS NULL";
            List<ConfigurationConstantResponseDTO> assetSphereList = assetSphereJdbcTemplate.query(sql, ASSETSPHERE_ROW_MAPPER);
            results.addAll(assetSphereList);
        } catch (Exception ex) {
            log.error("Failed to query AssetSphere AS_ConfigurationConstantTBL", ex);
        }

        // 2. Fetch SignForge local constants
        try {
            List<ConfigurationConstantResponseDTO> localList = configurationRepository.findAllByIsActiveTrue().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            for (ConfigurationConstantResponseDTO local : localList) {
                boolean alreadyPresent = results.stream().anyMatch(r -> r.getConfigurationKey().equalsIgnoreCase(local.getConfigurationKey()));
                if (!alreadyPresent) {
                    results.add(local);
                }
            }
        } catch (Exception ex) {
            log.error("Failed to query SignForge local SF_ConfigurationConstantTBL", ex);
        }

        return results;
    }

    @Override
    public Map<String, String> getConfigurationKeyValueMap() {
        Map<String, String> map = new HashMap<>();
        for (ConfigurationConstantResponseDTO dto : getAllActiveConfigurations()) {
            map.put(dto.getConfigurationKey(), dto.getConfigurationValue());
        }
        return map;
    }

    @Override
    public ConfigurationConstantResponseDTO getConfigurationByKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new ValidationCException("Configuration key must not be empty.");
        }
        String cleanKey = key.trim();

        // 1. Check live AssetSphere database first
        try {
            String sql = "SELECT id, configuration_key, configuration_value, notes, is_deleted, created_by, updated_by, created_at, updated_at " +
                    "FROM \"AS_ConfigurationConstantTBL\" " +
                    "WHERE configuration_key = ? AND (is_deleted = false OR is_deleted IS NULL) " +
                    "LIMIT 1";
            List<ConfigurationConstantResponseDTO> matches = assetSphereJdbcTemplate.query(sql, ASSETSPHERE_ROW_MAPPER, cleanKey);
            if (!matches.isEmpty()) {
                return matches.get(0);
            }
        } catch (Exception ex) {
            log.error("Error querying AssetSphere DB for key: {}", cleanKey, ex);
        }

        // 2. Check SignForge database
        Optional<ConfigurationConstantEntityClass> entityOpt = configurationRepository.findByConfigurationKeyIgnoreCaseAndIsActiveTrue(cleanKey);
        if (entityOpt.isPresent()) {
            return mapToResponse(entityOpt.get());
        }

        throw new ValidationCException("Configuration constant not found for key: " + key);
    }

    @Override
    public boolean getBooleanConfiguration(String key, boolean defaultValue) {
        try {
            ConfigurationConstantResponseDTO dto = getConfigurationByKey(key);
            if (dto != null && dto.getConfigurationValue() != null) {
                return Boolean.parseBoolean(dto.getConfigurationValue().trim());
            }
        } catch (Exception ignored) {}
        return defaultValue;
    }

    @Override
    public ConfigurationConstantResponseDTO updateConfiguration(String key, UpdateConfigurationConstantRequestDTO request, String updatedBy) {
        if (key == null || key.trim().isEmpty()) {
            throw new ValidationCException("Configuration key must not be empty.");
        }
        String cleanKey = key.trim();
        String formattedUpdatedBy = (updatedBy != null && !updatedBy.trim().isEmpty())
                ? updatedBy.trim().toUpperCase()
                : "SYSTEM_ADMIN";

        // Try updating in AssetSphere DB
        try {
            String updateSql = "UPDATE \"AS_ConfigurationConstantTBL\" " +
                    "SET configuration_value = ?, notes = COALESCE(?, notes), updated_at = NOW(), updated_by = ? " +
                    "WHERE configuration_key = ?";
            int rows = assetSphereJdbcTemplate.update(updateSql, request.getConfigurationValue().trim(), request.getDescription(), formattedUpdatedBy, cleanKey);
            if (rows > 0) {
                return getConfigurationByKey(cleanKey);
            }
        } catch (Exception ex) {
            log.error("Error updating AssetSphere DB for key: {}", cleanKey, ex);
        }

        // Otherwise update in SignForge local table
        Optional<ConfigurationConstantEntityClass> entityOpt = configurationRepository.findByConfigurationKeyIgnoreCase(cleanKey);
        if (entityOpt.isPresent()) {
            ConfigurationConstantEntityClass entity = entityOpt.get();
            entity.setConfigurationValue(request.getConfigurationValue().trim());
            if (request.getDescription() != null) {
                entity.setDescription(request.getDescription().trim());
            }
            if (request.getIsActive() != null) {
                entity.setActive(request.getIsActive());
            }
            entity.setUpdatedBy(formattedUpdatedBy);
            entity.setUpdatedAt(Instant.now());
            ConfigurationConstantEntityClass saved = configurationRepository.save(entity);
            return mapToResponse(saved);
        }

        throw new ValidationCException("Configuration constant not found for key: " + key);
    }

    @Override
    public void seedDefaultConfigurationIfAbsent(String key, String defaultValue, String description, String createdBy) {
        if (key == null || key.trim().isEmpty()) return;
        try {
            if (!configurationRepository.existsByConfigurationKeyIgnoreCase(key.trim())) {
                ConfigurationConstantEntityClass entity = ConfigurationConstantEntityClass.builder()
                        .configurationKey(key.trim())
                        .configurationValue(defaultValue)
                        .description(description)
                        .isActive(true)
                        .createdBy((createdBy != null ? createdBy : "SYSTEM_SEEDER").toUpperCase())
                        .build();
                configurationRepository.save(entity);
            }
        } catch (Exception ex) {
            log.warn("Could not seed configuration constant '{}': {}", key, ex.getMessage());
        }
    }

    @Override
    public ConfigurationConstantResponseDTO addDesignation(AddDesignationRequestDTO request, String updatedBy) {
        if (request == null || request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
            throw new ValidationCException("Department must not be empty.");
        }
        if (request.getDesignation() == null || request.getDesignation().trim().isEmpty()) {
            throw new ValidationCException("Designation must not be empty.");
        }

        String targetDept = request.getDepartment().trim();
        String targetDesignation = request.getDesignation().trim();
        String formattedUpdatedBy = (updatedBy != null && !updatedBy.trim().isEmpty()) ? updatedBy.trim().toUpperCase() : "SYSTEM_ADMIN";

        try {
            String selectSql = "SELECT configuration_value FROM \"AS_ConfigurationConstantTBL\" WHERE configuration_key = 'EMPLOYEE_DESIGNATIONS' LIMIT 1";
            String rawJson = assetSphereJdbcTemplate.queryForObject(selectSql, String.class);

            Map<String, List<String>> deptMap;
            if (rawJson != null && !rawJson.trim().isEmpty()) {
                deptMap = objectMapper.readValue(rawJson, new TypeReference<LinkedHashMap<String, List<String>>>() {});
            } else {
                deptMap = new LinkedHashMap<>();
            }

            List<String> roles = deptMap.computeIfAbsent(targetDept, k -> new ArrayList<>());
            boolean exists = roles.stream().anyMatch(r -> r.equalsIgnoreCase(targetDesignation));
            if (!exists) {
                roles.add(targetDesignation);
            }

            String updatedJson = objectMapper.writeValueAsString(deptMap);
            String updateSql = "UPDATE \"AS_ConfigurationConstantTBL\" " +
                    "SET configuration_value = ?, updated_at = NOW(), updated_by = ? " +
                    "WHERE configuration_key = 'EMPLOYEE_DESIGNATIONS'";
            assetSphereJdbcTemplate.update(updateSql, updatedJson, formattedUpdatedBy);

            log.info("Successfully added designation '{}' under department '{}' in AssetSphere AS_ConfigurationConstantTBL", targetDesignation, targetDept);
            return getConfigurationByKey("EMPLOYEE_DESIGNATIONS");
        } catch (Exception ex) {
            log.error("Failed to add designation in AssetSphere DB", ex);
            throw new RuntimeException("Failed to add designation in AssetSphere database: " + ex.getMessage(), ex);
        }
    }

    @Override
    public ConfigurationConstantResponseDTO addDepartment(AddDepartmentRequestDTO request, String updatedBy) {
        if (request == null || request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
            throw new ValidationCException("Department must not be empty.");
        }

        String targetDept = request.getDepartment().trim();
        String formattedUpdatedBy = (updatedBy != null && !updatedBy.trim().isEmpty()) ? updatedBy.trim().toUpperCase() : "SYSTEM_ADMIN";

        try {
            String selectSql = "SELECT configuration_value FROM \"AS_ConfigurationConstantTBL\" WHERE configuration_key = 'EMPLOYEE_DESIGNATIONS' LIMIT 1";
            String rawJson = assetSphereJdbcTemplate.queryForObject(selectSql, String.class);

            Map<String, List<String>> deptMap;
            if (rawJson != null && !rawJson.trim().isEmpty()) {
                deptMap = objectMapper.readValue(rawJson, new TypeReference<LinkedHashMap<String, List<String>>>() {});
            } else {
                deptMap = new LinkedHashMap<>();
            }

            if (!deptMap.containsKey(targetDept)) {
                deptMap.put(targetDept, new ArrayList<>());
            }

            String updatedJson = objectMapper.writeValueAsString(deptMap);
            String updateSql = "UPDATE \"AS_ConfigurationConstantTBL\" " +
                    "SET configuration_value = ?, updated_at = NOW(), updated_by = ? " +
                    "WHERE configuration_key = 'EMPLOYEE_DESIGNATIONS'";
            assetSphereJdbcTemplate.update(updateSql, updatedJson, formattedUpdatedBy);

            log.info("Successfully added department '{}' in AssetSphere AS_ConfigurationConstantTBL", targetDept);
            return getConfigurationByKey("EMPLOYEE_DESIGNATIONS");
        } catch (Exception ex) {
            log.error("Failed to add department in AssetSphere DB", ex);
            throw new RuntimeException("Failed to add department in AssetSphere database: " + ex.getMessage(), ex);
        }
    }

    @Override
    public ConfigurationConstantResponseDTO addWorkLocation(AddWorkLocationRequestDTO request, String updatedBy) {
        if (request == null || request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new ValidationCException("Work location must not be empty.");
        }

        String targetLocation = request.getLocation().trim();
        String formattedUpdatedBy = (updatedBy != null && !updatedBy.trim().isEmpty()) ? updatedBy.trim().toUpperCase() : "SYSTEM_ADMIN";

        try {
            String selectSql = "SELECT configuration_value FROM \"AS_ConfigurationConstantTBL\" WHERE configuration_key = 'WORK_LOCATIONS' LIMIT 1";
            String rawJson = assetSphereJdbcTemplate.queryForObject(selectSql, String.class);

            List<String> locations;
            if (rawJson != null && !rawJson.trim().isEmpty()) {
                locations = objectMapper.readValue(rawJson, new TypeReference<ArrayList<String>>() {});
            } else {
                locations = new ArrayList<>();
            }

            boolean exists = locations.stream().anyMatch(loc -> loc.equalsIgnoreCase(targetLocation));
            if (!exists) {
                locations.add(targetLocation);
            }

            String updatedJson = objectMapper.writeValueAsString(locations);
            String updateSql = "UPDATE \"AS_ConfigurationConstantTBL\" " +
                    "SET configuration_value = ?, updated_at = NOW(), updated_by = ? " +
                    "WHERE configuration_key = 'WORK_LOCATIONS'";
            assetSphereJdbcTemplate.update(updateSql, updatedJson, formattedUpdatedBy);

            log.info("Successfully added work location '{}' in AssetSphere AS_ConfigurationConstantTBL", targetLocation);
            return getConfigurationByKey("WORK_LOCATIONS");
        } catch (Exception ex) {
            log.error("Failed to add work location in AssetSphere DB", ex);
            throw new RuntimeException("Failed to add work location in AssetSphere database: " + ex.getMessage(), ex);
        }
    }

    private ConfigurationConstantResponseDTO mapToResponse(ConfigurationConstantEntityClass entity) {
        return ConfigurationConstantResponseDTO.builder()
                .id(entity.getId())
                .configurationKey(entity.getConfigurationKey())
                .configurationValue(entity.getConfigurationValue())
                .description(entity.getDescription())
                .isActive(entity.isActive())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
