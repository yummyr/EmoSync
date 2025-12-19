package com.emosync.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring AI Configuration
 */
@Configuration
@Slf4j
public class SpringAIConfig {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.options.model}")
    private String model;

    /**
     * OpenAI API Client
     */
    @Bean
    public OpenAiApi openAiApi() {
        log.info("🔧 Initializing OpenAI API Client");
        log.info("🌐 Using API Base URL: {}", baseUrl);
        return new OpenAiApi(baseUrl, apiKey);
    }

    /**
     * OpenAI Chat Model
     */
    @Bean
    public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
        log.info("🤖 Loaded OpenAI model: {}", model);
        return new OpenAiChatModel(openAiApi,
                OpenAiChatOptions.builder()
                        .withModel(model)
                        .withTemperature(0.7)
                        .build()
        );
    }

    /**
     * Chat Memory (In-Memory)
     */
    @Bean
    public ChatMemory chatMemory() {
        log.info("🧠 InMemory ChatMemory initialized");
        return new InMemoryChatMemory();
    }
}