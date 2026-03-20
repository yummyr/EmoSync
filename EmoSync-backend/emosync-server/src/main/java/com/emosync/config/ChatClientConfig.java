package com.emosync.config;

import com.emosync.ai.Tools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
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
        return MessageWindowChatMemory.builder()
                .maxMessages(MAX_MEMORY_MESSAGE_SIZE)
                .build();
    }



    @Bean("open-ai")
    //SiliconFlow
    public ChatClient openAiChatClient(OpenAiChatModel openAiChatModel,
                                       ChatMemory chatMemory,
                                       Tools tools){

        return ChatClient.builder(openAiChatModel)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .defaultSystem(DEFAULT_SYSTEM)
                .defaultTools(tools)
                .build();
    }
}
