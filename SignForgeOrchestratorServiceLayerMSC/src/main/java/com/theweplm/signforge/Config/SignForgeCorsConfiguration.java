package com.theweplm.signforge.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * Enterprise Cross-Origin Resource Sharing (CORS) Configuration.
 * Fully authorizes React / Vite Single Page Application on localhost:3000 and enterprise domains.
 */
@Configuration
public class SignForgeCorsConfiguration implements WebMvcConfigurer {

    @Value("${signforge.security.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,https://signforge.theweplm.com}")
    private String allowedOriginsConfig;

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);

        List<String> origins = Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        for (String origin : origins) {
            config.addAllowedOriginPattern(origin);
        }
        config.addAllowedOriginPattern("http://localhost:[*]");
        config.addAllowedOriginPattern("http://127.0.0.1:[*]");
        config.addAllowedOriginPattern("http://192.168.*:[*]");
        config.addAllowedOriginPattern("http://10.*:[*]");
        config.addAllowedOriginPattern("http://172.*:[*]");
        config.addAllowedOriginPattern("https://*.theweplm.com");
        config.addAllowedOriginPattern("https://*.vercel.app");

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type", "X-Total-Count", "Content-Disposition"));
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "http://192.168.*:*",
                        "http://10.*:*",
                        "http://172.*:*",
                        "https://*.theweplm.com",
                        "https://*.vercel.app"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type", "X-Total-Count", "Content-Disposition")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
