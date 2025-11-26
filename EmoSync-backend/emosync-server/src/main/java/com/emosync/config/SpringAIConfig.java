package com.emosync.config;

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
public class SpringAIConfig {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url:https://api.openai.com}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.options.model:gpt-3.5-turbo}")
    private String model;

    /**
     * OpenAI API Client
     */
    @Bean
    public OpenAiApi openAiApi() {
        return new OpenAiApi(baseUrl, apiKey);
    }

    /**
     * OpenAI Chat Model
     */
    @Bean
    public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
        return new OpenAiChatModel(openAiApi,
                OpenAiChatOptions.builder()
                        .withModel(model)
                        .withTemperature(0.7F)
                        .build()
        );
    }

    /**
     * Chat Memory (In-Memory)
     */
    @Bean
    public ChatMemory chatMemory() {
        return new InMemoryChatMemory();
    }
}