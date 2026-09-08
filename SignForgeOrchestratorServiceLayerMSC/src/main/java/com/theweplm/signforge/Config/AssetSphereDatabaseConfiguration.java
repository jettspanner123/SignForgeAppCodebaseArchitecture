package com.theweplm.signforge.Config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class AssetSphereDatabaseConfiguration {

    @Bean(name = "assetSphereDataSourceProperties")
    @ConfigurationProperties(prefix = "assetsphere.datasource")
    public DataSourceProperties assetSphereDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "assetSphereDataSource")
    public DataSource assetSphereDataSource(@Qualifier("assetSphereDataSourceProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean(name = "assetSphereJdbcTemplate")
    public JdbcTemplate assetSphereJdbcTemplate(@Qualifier("assetSphereDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean(name = "assetSphereNamedJdbcTemplate")
    public NamedParameterJdbcTemplate assetSphereNamedJdbcTemplate(@Qualifier("assetSphereDataSource") DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }
}
