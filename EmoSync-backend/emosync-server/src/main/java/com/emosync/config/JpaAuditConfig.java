package com.emosync.config;

import com.emosync.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Enables automatic JPA auditing for create/update employee fields.
 */
@Configuration
@Slf4j
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditConfig {

    /**
     * Provide the current logged-in user's ID for JPA auditing.
     */
    @Bean
    public AuditorAware<Long> auditorAware() {
        return () -> {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl user) {
                return Optional.of(user.getId());
            }
            return Optional.of(0L);
        };
    }


}