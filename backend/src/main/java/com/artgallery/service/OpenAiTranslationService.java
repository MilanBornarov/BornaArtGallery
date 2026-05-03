package com.artgallery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class OpenAiTranslationService implements TranslationService {

    private static final String DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.translation-model:llama-3.1-8b-instant}")
    private String translationModel;

    @Value("${openai.base-url:" + DEFAULT_BASE_URL + "}")
    private String baseUrl;

    @Override
    public String translateMacedonianToEnglish(String text, String fieldLabel) {
        return translate(
                text,
                fieldLabel,
                "Macedonian",
                "English",
                "You translate Macedonian gallery content into natural, polished English."
        );
    }

    @Override
    public String translateEnglishToMacedonian(String text, String fieldLabel) {
        return translate(
                text,
                fieldLabel,
                "English",
                "Macedonian",
                "You translate English gallery content into natural, polished Macedonian."
        );
    }

    private String translate(
            String text,
            String fieldLabel,
            String sourceLanguage,
            String targetLanguage,
            String roleInstruction
    ) {
        if (text == null || text.isBlank()) {
            return null;
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Automatic translation is not configured. Set OPENAI_API_KEY for the backend."
            );
        }

        String systemPrompt = """
                %s
                Preserve tone and meaning.
                Return only the translation, with no explanations, labels, or quotation marks.
                """.formatted(roleInstruction);

        String userPrompt = """
                Translate this %s gallery %s into %s:

                %s
                """.formatted(sourceLanguage, fieldLabel, targetLanguage, text.trim());

        try {
            String requestBody = objectMapper.writeValueAsString(
                    new ChatCompletionsRequest(
                            translationModel,
                            java.util.List.of(
                                    new ChatMessage("system", systemPrompt),
                                    new ChatMessage("user", userPrompt)
                            ),
                            0.2
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(normalizeBaseUrl(baseUrl) + "/chat/completions"))
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String providerMessage = extractProviderErrorMessage(response.body());
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        providerMessage == null || providerMessage.isBlank()
                                ? "Automatic translation failed with LLM provider status " + response.statusCode()
                                : "Automatic translation failed with LLM provider status "
                                + response.statusCode() + ": " + providerMessage
                );
            }

            JsonNode body = objectMapper.readTree(response.body());
            String translated = extractOutputText(body);

            if (translated == null || translated.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Automatic translation returned an empty result"
                );
            }

            return translated.trim();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Automatic translation failed"
            );
        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Automatic translation failed"
            );
        }
    }

    private String normalizeBaseUrl(String rawBaseUrl) {
        String resolved = (rawBaseUrl == null || rawBaseUrl.isBlank()) ? DEFAULT_BASE_URL : rawBaseUrl.trim();
        if (resolved.endsWith("/")) {
            return resolved.substring(0, resolved.length() - 1);
        }
        return resolved;
    }

    private String extractOutputText(JsonNode body) {
        JsonNode choices = body.get("choices");
        if (choices != null && choices.isArray()) {
            for (JsonNode choice : choices) {
                JsonNode message = choice.get("message");
                if (message == null) {
                    continue;
                }

                JsonNode content = message.get("content");
                if (content == null) {
                    continue;
                }

                if (content.isTextual()) {
                    return content.asText();
                }

                if (content.isArray()) {
                    StringBuilder builder = new StringBuilder();
                    for (JsonNode contentItem : content) {
                        JsonNode text = contentItem.get("text");
                        if (text != null && text.isTextual()) {
                            if (!builder.isEmpty()) {
                                builder.append('\n');
                            }
                            builder.append(text.asText());
                        }
                    }
                    if (!builder.isEmpty()) {
                        return builder.toString();
                    }
                }
            }
        }

        JsonNode outputText = body.get("output_text");
        if (outputText != null && outputText.isTextual()) {
            return outputText.asText();
        }

        return null;
    }

    private String extractProviderErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }

        try {
            JsonNode body = objectMapper.readTree(responseBody);
            JsonNode error = body.get("error");
            if (error == null) {
                return null;
            }

            JsonNode message = error.get("message");
            if (message != null && message.isTextual()) {
                return message.asText();
            }
        } catch (IOException ignored) {
            return null;
        }

        return null;
    }

    private record ChatCompletionsRequest(String model, java.util.List<ChatMessage> messages, double temperature) {
    }

    private record ChatMessage(String role, String content) {
    }
}
