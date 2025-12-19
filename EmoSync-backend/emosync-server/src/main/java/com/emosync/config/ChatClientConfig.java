package com.emosync.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig {
    public static final Integer MAX_MEMORY_MESSAGE_SIZE =30;
    public static final String DEFAULT_SYSTEM="Your name is Sunny. You are a professional psychological counselor, gentle and patient, good at listening, able to provide professional psychological support and advice.";

    /**
     * Configure ChatMemory - In-memory conversation memory
     *
     * @return ChatMemory In-memory conversation memory instance
     */
    @Bean
    public ChatMemory chatMemory() {
        return new InMemoryChatMemory();
    }



    @Bean("open-ai")
    //SiliconFlow
    public ChatClient openAiChatClient(OpenAiChatModel openAiChatModel){

        return ChatClient.builder(openAiChatModel)
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory()))
                .defaultSystem(DEFAULT_SYSTEM)
                .build();
    }
}
