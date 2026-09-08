package com.theweplm.signforge.Utilities;

import com.theweplm.signforge.Constants.UserRoleType;
import com.theweplm.signforge.Models.Classes.UserEntityClass;
import com.theweplm.signforge.Repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "signforge.database.seed", havingValue = "true", matchIfMissing = false)
public class DatabaseSeederUtility implements CommandLineRunner {

    private final IUserRepository userRepository;

    private static final String DEFAULT_HASH = "U2lnbkZvcmdlU2FsdDEyMw==:0Ylw2urgRo2+bFqtN5JB5yseRjqQxNTixltgcyTTXLk="; // SignForge@2026

    @Override
    public void run(String... args) {
        try {
            List<UserEntityClass> seedUsers = List.of(
                    UserEntityClass.builder()
                            .email("admin@theweplm.com")
                            .passwordHash(DEFAULT_HASH)
                            .firstName("Enterprise")
                            .lastName("Admin")
                            .role(UserRoleType.ADMIN)
                            .department("EXECUTIVE")
                            .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80")
                            .isActive(true)
                            .isVerified(true)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build(),
                    UserEntityClass.builder()
                            .email("hr@theweplm.com")
                            .passwordHash(DEFAULT_HASH)
                            .firstName("Priya")
                            .lastName("Sharma")
                            .role(UserRoleType.HR_MANAGER)
                            .department("HUMAN_RESOURCES")
                            .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80")
                            .isActive(true)
                            .isVerified(true)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build(),
                    UserEntityClass.builder()
                            .email("director@theweplm.com")
                            .passwordHash(DEFAULT_HASH)
                            .firstName("Vikram")
                            .lastName("Mehta")
                            .role(UserRoleType.EXECUTIVE_DIRECTOR)
                            .department("EXECUTIVE_LEADERSHIP")
                            .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80")
                            .isActive(true)
                            .isVerified(true)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build(),
                    UserEntityClass.builder()
                            .email("developer@theweplm.com")
                            .passwordHash(DEFAULT_HASH)
                            .firstName("Uddeshya")
                            .lastName("Singh")
                            .role(UserRoleType.DEVELOPER)
                            .department("ENGINEERING")
                            .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80")
                            .isActive(true)
                            .isVerified(true)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build()
            );

            for (UserEntityClass user : seedUsers) {
                if (userRepository.findByEmailIgnoreCase(user.getEmail()).isEmpty()) {
                    userRepository.save(user);
                    log.info("Seeded enterprise account: {} ({})", user.getEmail(), user.getRole());
                }
            }
        } catch (Exception ex) {
            log.warn("Database seeding note: {}", ex.getMessage());
        }
    }
}
