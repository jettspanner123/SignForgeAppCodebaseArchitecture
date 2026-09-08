package com.theweplm.signforge.Utilities;

import com.theweplm.signforge.Features.ConfigurationConstant.Constants.ConfigurationConstantCON;
import com.theweplm.signforge.Features.ConfigurationConstant.Services.IConfigurationConstantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class ConfigurationConstantSeederUtility implements CommandLineRunner {

    private final IConfigurationConstantService configurationConstantService;

    @Override
    public void run(String... args) {
        try {
            // Seed PDFUploadFeatureWorking = false with created_by = SEEDER
            configurationConstantService.seedDefaultConfigurationIfAbsent(
                    ConfigurationConstantCON.KEY_PDF_UPLOAD_FEATURE_WORKING,
                    "false",
                    ConfigurationConstantCON.DESC_PDF_UPLOAD_FEATURE_WORKING,
                    ConfigurationConstantCON.SEEDER_CREATOR
            );
        } catch (Exception ex) {
            log.warn("Configuration constant seeding warning: {}", ex.getMessage());
        }
    }
}
