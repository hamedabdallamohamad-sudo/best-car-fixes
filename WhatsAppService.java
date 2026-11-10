package com.bestcar;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/** Sends a WhatsApp Cloud API template message to the business owner. */
@Service
public class WhatsAppService {
    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();

    @Value("${whatsapp.token}") String token;
    @Value("${whatsapp.phone-number-id}") String phoneId;
    @Value("${whatsapp.template}") String template;
    @Value("${whatsapp.lang}") String lang;

    public boolean send(String to, String summary) {
        if (token.isBlank() || phoneId.isBlank() || to == null || to.isBlank()) {
            log.warn("WhatsApp not configured; skipping notification");
            return false;
        }
        // Template parameters cannot contain new lines, tabs or 4+ consecutive spaces.
        String text = summary.replaceAll("[\\r\\n\\t]+", " | ").replaceAll(" {4,}", "   ");
        if (text.length() > 900) text = text.substring(0, 900);
        try {
            Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "type", "template",
                "template", Map.of(
                    "name", template,
                    "language", Map.of("code", lang),
                    "components", List.of(Map.of(
                        "type", "body",
                        "parameters", List.of(Map.of("type", "text", "text", text))))));
            HttpRequest req = HttpRequest.newBuilder(URI.create("https://graph.facebook.com/v21.0/" + phoneId + "/messages"))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
                .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() / 100 != 2) log.error("WhatsApp error {}: {}", res.statusCode(), res.body());
            return res.statusCode() / 100 == 2;
        } catch (Exception e) {
            log.error("WhatsApp send failed", e);
            return false;
        }
    }
}
