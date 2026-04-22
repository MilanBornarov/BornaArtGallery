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
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        AppProperties.Bucket config = resolveBucket(request);
        if (config == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getMethod() + ":" + request.getRequestURI() + ":" + resolveClientIp(request);
        Bucket bucket = buckets.computeIfAbsent(key, ignored -> newBucket(config));
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
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
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
}
