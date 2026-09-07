package com.theweplm.signforge.Features.ConfigurationConstant.Services;

import com.theweplm.signforge.Features.ConfigurationConstant.Models.ConfigurationConstantResponseDTO;
import com.theweplm.signforge.Features.ConfigurationConstant.Models.UpdateConfigurationConstantRequestDTO;

import java.util.List;
import java.util.Map;

public interface IConfigurationConstantService {

    List<ConfigurationConstantResponseDTO> getAllActiveConfigurations();

    Map<String, String> getConfigurationKeyValueMap();

    ConfigurationConstantResponseDTO getConfigurationByKey(String key);

    boolean getBooleanConfiguration(String key, boolean defaultValue);

    ConfigurationConstantResponseDTO updateConfiguration(String key, UpdateConfigurationConstantRequestDTO request, String updatedBy);

    void seedDefaultConfigurationIfAbsent(String key, String defaultValue, String description, String createdBy);
}
