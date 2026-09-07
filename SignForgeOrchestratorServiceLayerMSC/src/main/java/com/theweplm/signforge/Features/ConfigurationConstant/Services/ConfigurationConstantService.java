package com.theweplm.signforge.Features.ConfigurationConstant.Services;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.ConfigurationConstantResponseDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.UpdateConfigurationConstantRequestDTO;
import com.theweplm.signforge.Models.Classes.ConfigurationConstantEntityClass;
import com.theweplm.signforge.Repositories.IConfigurationConstantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfigurationConstantService implements IConfigurationConstantService {

    private final IConfigurationConstantRepository configurationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationConstantResponseDTO> getAllActiveConfigurations() {
        return configurationRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getConfigurationKeyValueMap() {
        Map<String, String> map = new HashMap<>();
        configurationRepository.findAllByIsActiveTrue().forEach(entity -> {
            map.put(entity.getConfigurationKey(), entity.getConfigurationValue());
        });
        return map;
    }

    @Override
    @Transactional(readOnly = true)
    public ConfigurationConstantResponseDTO getConfigurationByKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new ValidationCException("Configuration key must not be empty.");
        }
        Optional<ConfigurationConstantEntityClass> entityOpt = configurationRepository.findByConfigurationKeyIgnoreCaseAndIsActiveTrue(key.trim());
        if (entityOpt.isEmpty()) {
            throw new ValidationCException("Configuration constant not found for key: " + key);
        }
        return mapToResponse(entityOpt.get());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean getBooleanConfiguration(String key, boolean defaultValue) {
        if (key == null || key.trim().isEmpty()) {
            return defaultValue;
        }
        return configurationRepository.findByConfigurationKeyIgnoreCaseAndIsActiveTrue(key.trim())
                .map(entity -> Boolean.parseBoolean(entity.getConfigurationValue()))
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public ConfigurationConstantResponseDTO updateConfiguration(String key, UpdateConfigurationConstantRequestDTO request, String updatedBy) {
        if (key == null || key.trim().isEmpty()) {
            throw new ValidationCException("Configuration key must not be empty.");
        }

        Optional<ConfigurationConstantEntityClass> entityOpt = configurationRepository.findByConfigurationKeyIgnoreCase(key.trim());
        if (entityOpt.isEmpty()) {
            throw new ValidationCException("Configuration constant not found for key: " + key);
        }

        ConfigurationConstantEntityClass entity = entityOpt.get();
        entity.setConfigurationValue(request.getConfigurationValue().trim());
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription().trim());
        }
        if (request.getIsActive() != null) {
            entity.setActive(request.getIsActive());
        }

        // Ensure updated_by is always stored in ALL CAPS
        String formattedUpdatedBy = (updatedBy != null && !updatedBy.trim().isEmpty())
                ? updatedBy.trim().toUpperCase()
                : "SYSTEM_ADMIN";
        entity.setUpdatedBy(formattedUpdatedBy);
        entity.setUpdatedAt(Instant.now());

        ConfigurationConstantEntityClass saved = configurationRepository.save(entity);
        log.info("Updated configuration constant: {} = {} (by: {})", saved.getConfigurationKey(), saved.getConfigurationValue(), formattedUpdatedBy);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void seedDefaultConfigurationIfAbsent(String key, String defaultValue, String description, String createdBy) {
        if (key == null || key.trim().isEmpty()) return;

        String cleanKey = key.trim();
        if (!configurationRepository.existsByConfigurationKeyIgnoreCase(cleanKey)) {
            // Ensure created_by is always ALL CAPS
            String formattedCreatedBy = (createdBy != null && !createdBy.trim().isEmpty())
                    ? createdBy.trim().toUpperCase()
                    : "SEEDER";

            ConfigurationConstantEntityClass entity = ConfigurationConstantEntityClass.builder()
                    .configurationKey(cleanKey)
                    .configurationValue(defaultValue != null ? defaultValue.trim() : "false")
                    .description(description)
                    .isActive(true)
                    .createdBy(formattedCreatedBy)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            configurationRepository.save(entity);
            log.info("Seeded configuration constant: {} = {} (created_by: {})", cleanKey, defaultValue, formattedCreatedBy);
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
