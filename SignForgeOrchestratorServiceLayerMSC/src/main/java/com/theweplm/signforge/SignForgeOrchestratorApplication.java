package com.theweplm.signforge;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

/**
 * SignForge Multi-Party eSignature Orchestrator Backend Service.
 * Spring Boot 3.4.x / Java 21 Enterprise Microservice Layer.
 */
@SpringBootApplication
public class SignForgeOrchestratorApplication {

    public static void main(String[] args) {
        // Automatically load environment variables from .env if present
        loadEnvironmentVariables();
        SpringApplication.run(SignForgeOrchestratorApplication.class, args);
    }

    private static void loadEnvironmentVariables() {
        try {
            File currentDirEnv = new File(".env");
            File serverDirEnv = new File("SignForgeOrchestratorServiceLayerMSC/.env");
            
            Dotenv dotenv = null;
            if (currentDirEnv.exists()) {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            } else if (serverDirEnv.exists()) {
                dotenv = Dotenv.configure().directory("SignForgeOrchestratorServiceLayerMSC").ignoreIfMissing().load();
            }

            if (dotenv != null) {
                dotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
            }
        } catch (Exception ignored) {
            // Environment variables will fallback to OS environment if .env loader encounters issues
        }
    }
}

