package com.theweplm.signforge.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Enterprise PostgreSQL Database Configuration.
 * Strict Zero-Fallback Policy: connects exclusively to the configured PostgreSQL / Supabase instance.
 * Fails fast with a fatal exception on startup if the database is unreachable or secrets are missing.
 */
@Slf4j
@Configuration
public class DatabaseConfiguration {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("[SignForge DB] Initializing live PostgreSQL datasource: {}", dbUrl);

        if (dbUrl == null || dbUrl.isBlank()) {
            String errorMsg = "[FATAL] Missing SIGNFORGE_DATABASE_URL environment variable in SignForgeOrchestratorServiceLayerMSC/.env.";
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        try {
            HikariConfig config = new HikariConfig();
            config.setPoolName("SignForgeEnterpriseHikariPool");
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUsername);
            config.setPassword(dbPassword != null ? dbPassword : "");
            config.setDriverClassName("org.postgresql.Driver");
            
            // Connection pool optimization
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setConnectionTimeout(10000);
            config.setValidationTimeout(5000);
            config.setIdleTimeout(30000);
            config.setMaxLifetime(1200000);

            HikariDataSource ds = new HikariDataSource(config);

            // Strict Startup Fail-Fast Validation: probe live connection immediately
            try (Connection conn = ds.getConnection()) {
                String productName = conn.getMetaData().getDatabaseProductName();
                String productVersion = conn.getMetaData().getDatabaseProductVersion();
                log.info("[SignForge DB] Successfully established live connection to {} (Version: {})", productName, productVersion);
            }

            return ds;
        } catch (Exception ex) {
            String errorMsg = String.format("[FATAL] Could not connect to PostgreSQL Database at %s. Error: %s. Zero-fallback policy active — terminating startup.", dbUrl, ex.getMessage());
            log.error(errorMsg, ex);
            throw new IllegalStateException(errorMsg, ex);
        }
    }
}

