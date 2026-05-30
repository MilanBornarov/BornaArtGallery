package com.artgallery.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private static final long DB_CHECK_INTERVAL_MS = 120_000;

    private final JdbcTemplate jdbcTemplate;
    private final AtomicLong lastDbCheckMs = new AtomicLong(0);

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        long now = System.currentTimeMillis();
        long last = lastDbCheckMs.get();
        if (now - last > DB_CHECK_INTERVAL_MS && lastDbCheckMs.compareAndSet(last, now)) {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        }
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
