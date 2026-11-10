package com.bestcar;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.allowed-origins}") String[] origins;

    @Override
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET", "POST");
    }

    /** Max 10 POST requests per minute per IP (simple spam protection). */
    @Bean
    OncePerRequestFilter rateLimit() {
        Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                    throws ServletException, IOException {
                if ("POST".equals(req.getMethod())) {
                    String fwd = req.getHeader("X-Forwarded-For");
                    String ip = fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
                    Deque<Long> d = hits.computeIfAbsent(ip, k -> new ArrayDeque<>());
                    long now = System.currentTimeMillis();
                    synchronized (d) {
                        while (!d.isEmpty() && now - d.peekFirst() > 60_000) d.pollFirst();
                        if (d.size() >= 10) { res.sendError(429, "Too many requests"); return; }
                        d.addLast(now);
                    }
                }
                chain.doFilter(req, res);
            }
        };
    }
}
