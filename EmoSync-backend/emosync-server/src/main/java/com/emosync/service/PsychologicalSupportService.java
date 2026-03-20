package com.emosync.service;

import com.emosync.DTO.command.ConsultationSessionCreateDTO;
import com.emosync.ai.AiStructuredOutput;
import reactor.core.publisher.Flux;

public interface PsychologicalSupportService {
    AiStructuredOutput.StreamChatSession startChatSession(Long userId,
                                                          ConsultationSessionCreateDTO createDTO);

    Flux<String> streamPsychologicalChat(String sessionId, String userMessage);

    boolean endChatSession(String sessionId);

    Long extractSessionId(String sessionId);

    String generateConversationId(String sessionId);

    void saveUserMessageIfNeeded(Long dbSessionId, String userMessage);

    AiStructuredOutput.EmotionAnalysisResult getDefaultEmotionAnalysis();

    AiStructuredOutput.EmotionAnalysisResult analyzeUserEmotion(String content);

    void runAsyncEmotionAnalysis(Long dbSessionId, String userMessage);

    String cleanJsonString(String text);

}
