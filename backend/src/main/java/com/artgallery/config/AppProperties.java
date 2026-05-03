package com.artgallery.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private List<String> allowedOrigins = new ArrayList<>();
    private Auth auth = new Auth();
    private Upload upload = new Upload();
    private RateLimit rateLimit = new RateLimit();

    @Getter
    @Setter
    public static class Auth {
        @NotBlank
        private String refreshCookieName = "refresh_token";
        private boolean cookieSecure = false;
        @NotBlank
        private String cookieSameSite = "Lax";
    }

    @Getter
    @Setter
    public static class Upload {
        @Min(1)
        @Max(20)
        private int maxFileSizeMb = 10;
    }

    @Getter
    @Setter
    public static class RateLimit {
        private Bucket login = new Bucket(5, 15);
        private Bucket register = new Bucket(3, 30);
        private Bucket refresh = new Bucket(12, 15);
        private Bucket upload = new Bucket(10, 60);
        private Bucket adminMutation = new Bucket(30, 60);
        private Bucket favorites = new Bucket(30, 60);
    }

    @Getter
    @Setter
    public static class Bucket {
        @Min(1)
        private int capacity;
        @Min(1)
        private int windowMinutes;

        public Bucket() {
        }

        public Bucket(int capacity, int windowMinutes) {
            this.capacity = capacity;
            this.windowMinutes = windowMinutes;
        }
    }
}
