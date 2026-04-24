package com.artgallery.controller;

import com.artgallery.config.AppProperties;
import com.artgallery.dto.AuthDtos.AuthResponse;
import com.artgallery.dto.AuthDtos.LoginRequest;
import com.artgallery.dto.AuthDtos.RegisterRequest;
import com.artgallery.dto.MeResponse;
import com.artgallery.security.JwtUtil;
import com.artgallery.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String AJAX_HEADER = "X-Requested-With";
    private static final String AJAX_HEADER_VALUE = "XMLHttpRequest";

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final AppProperties appProperties;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        return buildAuthResponse(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        return buildAuthResponse(authService.register(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest request,
            @RequestHeader(value = AJAX_HEADER, required = false) String requestedWith) {
        validateAjaxRequest(requestedWith);
        return buildAuthResponse(authService.refresh(extractRefreshToken(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            @RequestHeader(value = AJAX_HEADER, required = false) String requestedWith) {
        validateAjaxRequest(requestedWith);
        authService.logout(extractRefreshToken(request));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.me(authentication.getName()));
    }

    private ResponseEntity<AuthResponse> buildAuthResponse(AuthService.AuthTokens authTokens) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(authTokens.refreshToken()).toString())
                .body(authTokens.response());
    }

    private ResponseCookie refreshCookie(String refreshToken) {
        return ResponseCookie.from(appProperties.getAuth().getRefreshCookieName(), refreshToken)
                .httpOnly(true)
                .secure(appProperties.getAuth().isCookieSecure())
                .sameSite(appProperties.getAuth().getCookieSameSite())
                .path("/auth")
                .maxAge(jwtUtil.getRefreshTokenExpirationMs() / 1000)
                .build();
    }

    private ResponseCookie expiredRefreshCookie() {
        return ResponseCookie.from(appProperties.getAuth().getRefreshCookieName(), "")
                .httpOnly(true)
                .secure(appProperties.getAuth().isCookieSecure())
                .sameSite(appProperties.getAuth().getCookieSameSite())
                .path("/auth")
                .maxAge(0)
                .build();
    }

    private String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        String cookieName = appProperties.getAuth().getRefreshCookieName();
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void validateAjaxRequest(String requestedWith) {
        if (!AJAX_HEADER_VALUE.equals(requestedWith)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Request could not be completed");
        }
    }
}
