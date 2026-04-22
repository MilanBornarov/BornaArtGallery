package com.artgallery.service;

import com.artgallery.dto.AuthDtos.AuthResponse;
import com.artgallery.dto.AuthDtos.LoginRequest;
import com.artgallery.dto.AuthDtos.RegisterRequest;
import com.artgallery.dto.MeResponse;
import com.artgallery.model.RefreshToken;
import com.artgallery.model.User;
import com.artgallery.repository.RefreshTokenRepository;
import com.artgallery.repository.UserRepository;
import com.artgallery.security.JwtUtil;
import com.artgallery.security.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenHasher tokenHasher;

    @Transactional
    public AuthTokens login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw invalidCredentials();
        }

        cleanupExpiredRefreshTokens();
        return issueTokens(user, UUID.randomUUID().toString());
    }

    @Transactional
    public AuthTokens register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account already exists");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        user = userRepository.save(user);
        cleanupExpiredRefreshTokens();
        return issueTokens(user, UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public MeResponse me(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new MeResponse(user.getId(), user.getEmail(), user.getRole());
    }

    @Transactional
    public AuthTokens refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing");
        }

        String tokenHash = tokenHasher.sha256(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid"));

        if (storedToken.isRevoked()) {
            refreshTokenRepository.revokeFamily(storedToken.getFamilyId(), LocalDateTime.now());
            log.warn("Refresh token reuse detected for userId={}, familyId={}",
                    storedToken.getUser().getId(), storedToken.getFamilyId());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid");
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(storedToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is expired");
        }

        AuthTokens rotatedTokens = issueTokens(storedToken.getUser(), storedToken.getFamilyId());
        storedToken.setRevokedAt(LocalDateTime.now());
        storedToken.setLastUsedAt(LocalDateTime.now());
        storedToken.setReplacedByTokenHash(tokenHasher.sha256(rotatedTokens.refreshToken()));
        refreshTokenRepository.save(storedToken);
        cleanupExpiredRefreshTokens();
        return rotatedTokens;
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(tokenHasher.sha256(rawRefreshToken))
                .ifPresent(token -> refreshTokenRepository.revokeFamily(token.getFamilyId(), LocalDateTime.now()));
    }

    private AuthTokens issueTokens(User user, String familyId) {
        String refreshToken = generateOpaqueRefreshToken();
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHasher.sha256(refreshToken))
                .familyId(familyId)
                .expiresAt(LocalDateTime.now().plus(jwtUtil.getRefreshTokenExpirationMs(), ChronoUnit.MILLIS))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        AuthResponse response = new AuthResponse(
                accessToken,
                "Bearer",
                jwtUtil.getAccessTokenExpirationSeconds(),
                user.getRole(),
                user.getEmail(),
                user.getId()
        );
        return new AuthTokens(response, refreshToken);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    private String generateOpaqueRefreshToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void cleanupExpiredRefreshTokens() {
        refreshTokenRepository.deleteExpired(LocalDateTime.now());
    }

    public record AuthTokens(AuthResponse response, String refreshToken) {
    }
}
