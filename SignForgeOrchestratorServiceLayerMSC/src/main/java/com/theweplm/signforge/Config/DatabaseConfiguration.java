package com.theweplm.signforge.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Slf4j
@Configuration
public class DatabaseConfiguration {

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (dbUrl != null && !dbUrl.isBlank() && dbPassword != null && !dbPassword.isBlank()) {
            try {
                log.info("Attempting connection to PostgreSQL datasource: {}", dbUrl);
                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(dbUrl);
                config.setUsername(dbUsername);
                config.setPassword(dbPassword);
                config.setDriverClassName("org.postgresql.Driver");
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);
                config.setConnectionTimeout(5000);
                config.setValidationTimeout(3000);

                HikariDataSource ds = new HikariDataSource(config);
                try (Connection conn = ds.getConnection()) {
                    log.info("Successfully connected to PostgreSQL datasource: {}", conn.getMetaData().getDatabaseProductName());
                    return ds;
                }
            } catch (Exception ex) {
                log.warn("Could not establish live PostgreSQL connection ({}). Falling back to in-memory H2 database.", ex.getMessage());
            }
        }

        log.info("Starting in-memory fallback H2 database (SignForgeInMemoryDb)...");
        HikariConfig h2Config = new HikariConfig();
        h2Config.setJdbcUrl("jdbc:h2:mem:SignForgeInMemoryDb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(5);

        return new HikariDataSource(h2Config);
    }
}
