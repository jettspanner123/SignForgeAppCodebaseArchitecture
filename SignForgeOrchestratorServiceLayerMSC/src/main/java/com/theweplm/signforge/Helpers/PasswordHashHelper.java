package com.theweplm.signforge.Helpers;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Singleton Password Hashing and Salt Verification Helper.
 */
public final class PasswordHashHelper {

    private static final PasswordHashHelper CURRENT = new PasswordHashHelper();
    private static final SecureRandom RANDOM = new SecureRandom();

    public static PasswordHashHelper getCurrent() {
        return CURRENT;
    }

    private PasswordHashHelper() {}

    public String hashPassword(String password) {
        if (password == null) {
            throw new IllegalArgumentException("Password cannot be null.");
        }
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        String saltBase64 = Base64.getEncoder().encodeToString(salt);
        String hash = computeHash(password, salt);
        return saltBase64 + ":" + hash;
    }

    public boolean verifyPassword(String password, String storedHash) {
        if (password == null || storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        String[] parts = storedHash.split(":", 2);
        byte[] salt = Base64.getDecoder().decode(parts[0]);
        String expectedHash = computeHash(password, salt);
        return expectedHash.equals(parts[1]);
    }

    private String computeHash(String password, byte[] salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashedPassword = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashedPassword);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available.", e);
        }
    }
}
