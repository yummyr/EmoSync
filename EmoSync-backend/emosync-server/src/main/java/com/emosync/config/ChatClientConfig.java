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
    public static final String DEFAULT_SYSTEM="你是一个专业的心理疏导师，温和耐心，善于倾听，能够提供专业的心理支持和建议。";

    /**
     * 配置ChatMemory - 内存存储的会话记忆
     *
     * @return ChatMemory 内存存储的会话记忆实例
     */
    @Bean
    public ChatMemory chatMemory() {
        return new InMemoryChatMemory();
    }



    @Bean("open-ai")
    //硅基流动
    public ChatClient openAiChatClient(OpenAiChatModel openAiChatModel){

        return ChatClient.builder(openAiChatModel)
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory()))
                .defaultSystem(DEFAULT_SYSTEM)
                .build();
    }
}
