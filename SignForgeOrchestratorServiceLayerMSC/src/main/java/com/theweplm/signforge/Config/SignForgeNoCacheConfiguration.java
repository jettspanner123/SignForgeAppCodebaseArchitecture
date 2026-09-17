package com.theweplm.signforge.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Forces every /Api/** response to be explicitly non-cacheable.
 *
 * Without this, the backend sends no caching headers at all, and browsers can still silently
 * reuse a stale GET response for these constantly-changing endpoints (offer lists, dashboard
 * data) - the absence of a Cache-Control header is not the same as an explicit no-store, and
 * a client-issued "refetch" can come back with old data if the browser's HTTP cache serves it
 * without ever reaching this server. This was the root cause of deleted/updated documents
 * appearing to silently revert until a hard reload happened to bypass the cache.
 */
@Configuration
public class SignForgeNoCacheConfiguration {

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> noCacheFilterRegistrationBean() {
        OncePerRequestFilter filter = new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                response.setHeader("Pragma", "no-cache");
                filterChain.doFilter(request, response);
            }
        };

        FilterRegistrationBean<OncePerRequestFilter> bean = new FilterRegistrationBean<>(filter);
        bean.addUrlPatterns("/Api/*");
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        return bean;
    }
}
