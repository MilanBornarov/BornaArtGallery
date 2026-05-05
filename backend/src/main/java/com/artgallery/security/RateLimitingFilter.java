package com.artgallery.security;

import com.artgallery.config.AppProperties;
import com.artgallery.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Instant;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Duration CLEANUP_INTERVAL = Duration.ofMinutes(1);
    private static final int EXPIRY_WINDOW_MULTIPLIER = 2;

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final Map<String, StoredBucket> buckets = new ConcurrentHashMap<>();
    private final AtomicLong nextCleanupEpochMs = new AtomicLong(0);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        AppProperties.Bucket config = resolveBucket(request);
        if (config == null) {
            filterChain.doFilter(request, response);
            return;
        }

        cleanupExpiredBuckets();
        String key = request.getMethod() + ":" + request.getRequestURI() + ":" + resolveClientIp(request);
        StoredBucket storedBucket = buckets.computeIfAbsent(key, ignored -> new StoredBucket(newBucket(config)));
        storedBucket.touch();
        Bucket bucket = storedBucket.bucket();
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ErrorResponse.of(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                "Too many requests. Please try again later."
        ));
    }

    private Bucket newBucket(AppProperties.Bucket config) {
        Bandwidth limit = Bandwidth.classic(
                config.getCapacity(),
                Refill.greedy(config.getCapacity(), Duration.ofMinutes(config.getWindowMinutes()))
        );
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String remoteAddress = normalizeIp(request.getRemoteAddr());
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (isTrustedProxy(remoteAddress) && forwardedFor != null && !forwardedFor.isBlank()) {
            return Arrays.stream(forwardedFor.split(","))
                    .map(this::normalizeIp)
                    .filter(this::isValidIp)
                    .findFirst()
                    .orElse(remoteAddress);
        }
        return remoteAddress;
    }

    private String normalizeIp(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        return value.trim();
    }

    private boolean isTrustedProxy(String remoteAddress) {
        if (!isValidIp(remoteAddress)) {
            return false;
        }

        return appProperties.getRateLimit().getTrustedProxies().stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .anyMatch(trustedProxy -> ipMatches(remoteAddress, trustedProxy));
    }

    private boolean ipMatches(String remoteAddress, String trustedProxy) {
        if (trustedProxy.contains("/")) {
            return cidrMatches(remoteAddress, trustedProxy);
        }
        if (!isIpLiteral(trustedProxy)) {
            return false;
        }
        try {
            return InetAddress.getByName(remoteAddress).equals(InetAddress.getByName(trustedProxy));
        } catch (UnknownHostException ex) {
            return false;
        }
    }

    private boolean cidrMatches(String remoteAddress, String cidr) {
        String[] parts = cidr.split("/", 2);
        if (parts.length != 2) {
            return false;
        }

        try {
            if (!isIpLiteral(parts[0])) {
                return false;
            }
            InetAddress remote = InetAddress.getByName(remoteAddress);
            InetAddress network = InetAddress.getByName(parts[0]);
            byte[] remoteBytes = remote.getAddress();
            byte[] networkBytes = network.getAddress();
            int prefixLength = Integer.parseInt(parts[1]);

            if (remoteBytes.length != networkBytes.length || prefixLength < 0 || prefixLength > remoteBytes.length * 8) {
                return false;
            }

            int fullBytes = prefixLength / 8;
            int remainingBits = prefixLength % 8;
            for (int index = 0; index < fullBytes; index++) {
                if (remoteBytes[index] != networkBytes[index]) {
                    return false;
                }
            }
            if (remainingBits == 0) {
                return true;
            }

            int mask = 0xFF << (8 - remainingBits);
            return (remoteBytes[fullBytes] & 0xFF & mask) == (networkBytes[fullBytes] & 0xFF & mask);
        } catch (NumberFormatException | UnknownHostException ex) {
            return false;
        }
    }

    private boolean isValidIp(String value) {
        if (value == null || value.isBlank() || "unknown".equalsIgnoreCase(value)) {
            return false;
        }
        if (!isIpLiteral(value)) {
            return false;
        }

        try {
            InetAddress.getByName(value);
            return true;
        } catch (UnknownHostException ex) {
            return false;
        }
    }

    private boolean isIpLiteral(String value) {
        return value != null && (value.contains(":") || value.matches("[0-9.]+"));
    }

    private void cleanupExpiredBuckets() {
        long now = System.currentTimeMillis();
        long scheduledCleanup = nextCleanupEpochMs.get();
        if (now < scheduledCleanup || !nextCleanupEpochMs.compareAndSet(scheduledCleanup, now + CLEANUP_INTERVAL.toMillis())) {
            return;
        }

        Instant expiresBefore = Instant.now().minus(Duration.ofMinutes(maxWindowMinutes() * EXPIRY_WINDOW_MULTIPLIER));
        buckets.entrySet().removeIf(entry -> entry.getValue().lastSeen().isBefore(expiresBefore));
    }

    private int maxWindowMinutes() {
        AppProperties.RateLimit rateLimit = appProperties.getRateLimit();
        List<AppProperties.Bucket> configuredBuckets = List.of(
                rateLimit.getLogin(),
                rateLimit.getRegister(),
                rateLimit.getRefresh(),
                rateLimit.getUpload(),
                rateLimit.getAdminMutation(),
                rateLimit.getFavorites()
        );
        return configuredBuckets.stream()
                .mapToInt(AppProperties.Bucket::getWindowMinutes)
                .max()
                .orElse(60);
    }

    private AppProperties.Bucket resolveBucket(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("/auth/login".equals(path) && HttpMethod.POST.matches(method)) {
            return appProperties.getRateLimit().getLogin();
        }
        if ("/auth/register".equals(path) && HttpMethod.POST.matches(method)) {
            return appProperties.getRateLimit().getRegister();
        }
        if ("/auth/refresh".equals(path) && HttpMethod.POST.matches(method)) {
            return appProperties.getRateLimit().getRefresh();
        }
        if ("/favorites".equals(path) && HttpMethod.POST.matches(method)) {
            return appProperties.getRateLimit().getFavorites();
        }
        if (path.startsWith("/favorites/") && HttpMethod.DELETE.matches(method)) {
            return appProperties.getRateLimit().getFavorites();
        }
        if ((path.equals("/artworks") || path.equals("/api/artworks")) && HttpMethod.POST.matches(method)) {
            return appProperties.getRateLimit().getUpload();
        }
        if ((path.startsWith("/artworks/") || path.startsWith("/api/artworks/"))
                && (HttpMethod.PUT.matches(method) || HttpMethod.PATCH.matches(method) || HttpMethod.DELETE.matches(method))) {
            return appProperties.getRateLimit().getAdminMutation();
        }
        return null;
    }

    private static class StoredBucket {
        private final Bucket bucket;
        private volatile Instant lastSeen;

        private StoredBucket(Bucket bucket) {
            this.bucket = bucket;
            touch();
        }

        private Bucket bucket() {
            return bucket;
        }

        private Instant lastSeen() {
            return lastSeen;
        }

        private void touch() {
            lastSeen = Instant.now();
        }
    }
}
