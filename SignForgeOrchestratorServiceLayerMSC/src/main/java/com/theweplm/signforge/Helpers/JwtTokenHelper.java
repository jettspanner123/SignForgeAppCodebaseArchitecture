package com.theweplm.signforge.Helpers;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Singleton JWT Access and Refresh Token Helper using HMAC-SHA256.
 */
public final class JwtTokenHelper {

    private static final JwtTokenHelper CURRENT = new JwtTokenHelper();
    private static final String DEFAULT_SECRET = "SignForgeEnterpriseESignatureJwtSecretKey2026SecureKeyDefault123456789";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static JwtTokenHelper getCurrent() {
        return CURRENT;
    }

    private JwtTokenHelper() {}

    public String generateAccessToken(String userId, String email, String role, String fullName, long expiryMinutes) {
        try {
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            long nowSeconds = Instant.now().getEpochSecond();
            long expSeconds = nowSeconds + (expiryMinutes * 60);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", userId);
            payload.put("email", email);
            payload.put("role", role);
            payload.put("name", fullName);
            payload.put("iat", nowSeconds);
            payload.put("exp", expSeconds);

            String headerBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(MAPPER.writeValueAsBytes(header));
            String payloadBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(MAPPER.writeValueAsBytes(payload));

            String content = headerBase64 + "." + payloadBase64;
            String signature = signHmacSha256(content, DEFAULT_SECRET);

            return content + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    public Map<String, Object> validateAndExtractClaims(String token) {
        try {
            if (token == null || !token.contains(".")) {
                return null;
            }
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String content = parts[0] + "." + parts[1];
            String expectedSignature = signHmacSha256(content, DEFAULT_SECRET);
            if (!expectedSignature.equals(parts[2])) {
                return null;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            @SuppressWarnings("unchecked")
            Map<String, Object> claims = MAPPER.readValue(payloadBytes, Map.class);

            long exp = ((Number) claims.get("exp")).longValue();
            if (Instant.now().getEpochSecond() > exp) {
                return null; // Expired
            }

            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    private String signHmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }
}
