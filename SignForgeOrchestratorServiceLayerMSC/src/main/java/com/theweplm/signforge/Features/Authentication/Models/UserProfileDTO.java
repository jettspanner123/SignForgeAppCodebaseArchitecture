package com.theweplm.signforge.Features.Authentication.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserProfileDTO {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String department;
    private String avatarUrl;
    private boolean isVerified;
    private Instant lastLoginAt;

    public String getFullName() {
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }
}
