package com.emosync.AiService;

import com.emosync.DTO.command.ConsultationSessionCreateDTO;
import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.entity.ConsultationSession;
import com.emosync.service.ConsultationMessageService;
import com.emosync.service.ConsultationSessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Streaming psychological support service - OpenAI Version
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PsychologicalSupportService {

    @Value("${spring.ai.openai.chat.options.model}")
    private String model;

    /**
     * Spring AI OpenAI Chat Model (Inject OpenAiChatModel directly)
     */
    private final OpenAiChatModel openAiChatModel;

    /**
     * Conversation memory for Spring AI
     */
    private final ChatMemory chatMemory;

    /**
     * DB service for consultation sessions
     */
    private final ConsultationSessionService consultationSessionService;

    /**
     * DB service for consultation messages
     */
    private final ConsultationMessageService consultationMessageService;

    /**
     * Jackson mapper for JSON construction
     */
    private final ObjectMapper objectMapper;

    /**
     * Start a new psychological support session.
     */
    public StructOutPut.StreamChatSession startChatSession(Long userId,
                                                           ConsultationSessionCreateDTO createDTO) {
        log.info("Starting new psychological support session, userId={}", userId);

        try {
            // 1. Create session record in database
            ConsultationSession dbSession =
                    consultationSessionService.createSession(userId, createDTO);

            // 2. Save initial user message to database
            consultationMessageService.saveUserMessage(
                    dbSession.getId(),
                    createDTO.getInitialMessage(),
                    null
            );

            // 3. Build session and conversation IDs
            String sessionId = "session_" + dbSession.getId();
            String conversationId = generateConversationId(sessionId);

            // 4. Build response session object
            StructOutPut.StreamChatSession session =
                    new StructOutPut.StreamChatSession(
                            sessionId,
                            userId,
                            createDTO.getInitialMessage(),
                            System.currentTimeMillis(),
                            System.currentTimeMillis() + 86_400_000L,
                            "ACTIVE",
                            new ArrayList<>(),
                            1
                    );

            // 5. Put initial message into ChatMemory
            if (createDTO.getInitialMessage() != null
                    && !createDTO.getInitialMessage().trim().isEmpty()) {

                List<Message> messages = new ArrayList<>();
                messages.add(new UserMessage(createDTO.getInitialMessage()));
                chatMemory.add(conversationId, messages);

                log.info("Initial message added to ChatMemory, conversationId={}",
                        conversationId);
            }

            log.info("Psychological support session created, sessionId={}, dbSessionId={}",
                    sessionId, dbSession.getId());
            return session;

        } catch (Exception e) {
            log.error("Failed to create psychological support session", e);
            throw new RuntimeException("Failed to create session: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ Streaming psychological support chat - using OpenAiChatModel
     */
    public Flux<String> streamPsychologicalChat(String sessionId, String userMessage) {
        log.info("Starting streaming psychological chat, sessionId={}, message={}",
                sessionId, userMessage);

        return Flux.create(sink -> {
            try {
                // 1. Validate session
                Long dbSessionId = extractSessionId(sessionId);
                if (dbSessionId == null) {
                    sink.error(new RuntimeException("Invalid sessionId format"));
                    return;
                }

                ConsultationSession dbSession =
                        consultationSessionService.getSessionById(dbSessionId);
                if (dbSession == null) {
                    sink.error(new RuntimeException("Session not found"));
                    return;
                }

                // 2. Generate conversationId
                String conversationId = generateConversationId(sessionId);

                // 3. Save user message (avoid duplicates)
                saveUserMessageIfNeeded(dbSessionId, userMessage);

                // 4. Asynchronous emotion analysis
                CompletableFuture.runAsync(() ->
                        runAsyncEmotionAnalysis(dbSessionId, userMessage)
                );

                // 5. ✅ Get historical messages from ChatMemory
                List<Message> historyMessages = chatMemory.get(conversationId, 10);

                // 6. ✅ Build complete message list
                List<Message> allMessages = new ArrayList<>();

                // Add system prompt
                allMessages.add(new SystemMessage(
                        PromptManage.PSYCHOLOGICAL_SUPPORT_SYSTEM_PROMPT
                ));

                // Add historical messages
                if (historyMessages != null && !historyMessages.isEmpty()) {
                    allMessages.addAll(historyMessages);
                }

                // Add current user message
                allMessages.add(new UserMessage(userMessage));

                // 7. Save user message to ChatMemory
                chatMemory.add(conversationId, List.of(new UserMessage(userMessage)));

                // 8. ✅ Create Prompt object
                Prompt prompt = new Prompt(allMessages,
                        OpenAiChatOptions.builder()
                                .withModel(model)  // or your configured model
                                .withTemperature(0.7)
                                .withMaxTokens(2000)
                                .build()
                );

                // 9. ✅ Use OpenAiChatModel for streaming call
                StringBuilder fullResponse = new StringBuilder();

                openAiChatModel.stream(prompt)
                        .flatMap(chatResponse -> {
                            // Extract content from ChatResponse
                            if (chatResponse.getResults() != null &&
                                    chatResponse.getResult().getOutput() != null) {
                                String content = chatResponse.getResult()
                                        .getOutput()
                                        .getContent();
                                if (content != null) {
                                    return Flux.just(content);
                                }

                            }
                            return Flux.empty();
                        })
                        .doOnNext(fragment -> {
                            fullResponse.append(fragment);
                            sink.next(fragment);
                        })
                        .doOnError(error -> {
                            log.error("Streaming error", error);
                            sink.error(error);
                        })
                        .doOnComplete(() -> {
                            String fullReply = fullResponse.toString();

                            // Asynchronously save to database
                            CompletableFuture.runAsync(() -> {
                                try {
                                    consultationMessageService.saveAiMessage(
                                            dbSessionId, fullReply, "openai"
                                    );
                                    log.info("AI reply saved to DB, length={}",
                                            fullReply.length());
                                } catch (Exception e) {
                                    log.warn("Failed to save AI reply", e);
                                }
                            });

                            // Synchronously add to ChatMemory
                            try {
                                chatMemory.add(
                                        conversationId,
                                        List.of(new AssistantMessage(fullReply))
                                );
                                log.info("AI reply added to ChatMemory");
                            } catch (Exception e) {
                                log.warn("Failed to add to ChatMemory", e);
                            }

                            sink.complete();
                            log.info("Stream completed, sessionId={}", sessionId);
                        })
                        .subscribe();

            } catch (Exception e) {
                log.error("Failed to start streaming", e);
                sink.error(e);
            }
        });
    }

    /**
     * End chat session
     */
    public boolean endChatSession(String sessionId, Integer moodAfter) {
        try {
            log.info("Ending psychological support session, sessionId={}", sessionId);

            Long dbSessionId = extractSessionId(sessionId);
            if (dbSessionId == null) {
                log.error("Invalid sessionId format: {}", sessionId);
                return false;
            }

            ConsultationSession dbSession =
                    consultationSessionService.getSessionById(dbSessionId);
            if (dbSession == null) {
                log.error("Session not found, id={}", dbSessionId);
                return false;
            }

            String conversationId = generateConversationId(sessionId);
            try {
                chatMemory.clear(conversationId);
                log.info("ChatMemory cleared for conversationId={}", conversationId);
            } catch (Exception e) {
                log.warn("Failed to clear ChatMemory", e);
            }

            log.info("Session ended successfully, sessionId={}", sessionId);
            return true;

        } catch (Exception e) {
            log.error("Failed to end psychological support session", e);
            return false;
        }
    }

    /**
     * Extract DB session ID from sessionId string
     */
    public Long extractSessionId(String sessionId) {
        try {
            if (sessionId != null && sessionId.startsWith("session_")) {
                String idStr = sessionId.substring("session_".length());
                return Long.parseLong(idStr);
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to extract session id from sessionId={}", sessionId, e);
            return null;
        }
    }

    /**
     * Generate conversation id for ChatMemory
     */
    private String generateConversationId(String sessionId) {
        return "conversation_" + sessionId;
    }

    /**
     * Save user message if not duplicate
     */
    private void saveUserMessageIfNeeded(Long dbSessionId, String userMessage) {
        try {
            Integer messageCount =
                    consultationMessageService.getMessageCountBySessionId(dbSessionId);
            boolean isInitialMessage = false;

            if (messageCount == 1) {
                ConsultationMessageResponseDTO lastMessage =
                        consultationMessageService.getLastMessageBySessionId(dbSessionId);
                if (lastMessage != null
                        && lastMessage.getSenderType() == 1
                        && userMessage.equals(lastMessage.getContent())) {
                    isInitialMessage = true;
                    log.info("Detected duplicate initial message, skip saving.");
                }
            }

            if (!isInitialMessage) {
                consultationMessageService.saveUserMessage(dbSessionId, userMessage, null);
                log.info("User message saved to DB");
            }
        } catch (Exception e) {
            log.warn("Failed to save user message to DB", e);
        }
    }

    /**
     * Default emotion analysis result
     */
    public StructOutPut.EmotionAnalysisResult getDefaultEmotionAnalysis() {
        return new StructOutPut.EmotionAnalysisResult(
                "Neutral",
                50,
                false,
                0,
                new ArrayList<>(),
                "Your emotional state looks relatively stable. Take things step by step.",
                "😐",
                "Calm",
                "No significant psychological risk detected at the moment.",
                List.of("Maintain regular sleep schedule", "Do some light exercise", "Talk to friends"),
                Instant.now().toString()

        );
    }

    /**
     * Quick emotion analysis using LLM
     */
    public StructOutPut.EmotionAnalysisResult analyzeUserEmotion(String content) {
        log.info("Starting quick emotion analysis");

        try {
            List<Message> messages = new ArrayList<>();
            messages.add(new SystemMessage(PromptManage.EMOTION_ANALYSIS_SYSTEM_PROMPT));
            messages.add(new UserMessage(
                    "Please quickly analyze the emotional state of the following content:\n" + content
            ));

            Prompt prompt = new Prompt(messages);

            ChatResponse response = openAiChatModel.call(prompt);
            String resultJson = response.getResult().getOutput().getContent();
            String cleanedJson = cleanJsonString(resultJson);
            log.debug("Cleaned emotion JSON: {}", cleanedJson);

            // Parse JSON response to EmotionAnalysisResult
            StructOutPut.EmotionAnalysisResult result =
                    objectMapper.readValue(cleanedJson, StructOutPut.EmotionAnalysisResult.class);

            log.info("Emotion analysis done: emotion={}, riskLevel={}",
                    result.primaryEmotion(), result.riskLevel());
            return result;
        } catch (Exception e) {
            log.error("Emotion analysis failed, using default result", e);
            return getDefaultEmotionAnalysis();
        }
    }

    /**
     * Run emotion analysis asynchronously
     */
    private void runAsyncEmotionAnalysis(Long dbSessionId, String userMessage) {
        try {
            log.info("Running async emotion analysis, sessionId={}", dbSessionId);

            StructOutPut.EmotionAnalysisResult emotionAnalysis =
                    analyzeUserEmotion(userMessage);

            // Build JSON using Jackson
            ObjectNode node = objectMapper.createObjectNode();
            node.put("primaryEmotion", emotionAnalysis.primaryEmotion());
            node.put("emotionScore", emotionAnalysis.emotionScore());
            node.put("isNegative", emotionAnalysis.isNegative());
            node.put("riskLevel", emotionAnalysis.riskLevel());
            node.put("suggestion", emotionAnalysis.suggestion());
            node.put("icon", emotionAnalysis.icon());
            node.put("label", emotionAnalysis.label());
            node.put("riskDescription", emotionAnalysis.riskDescription());
            node.put("timestamp", emotionAnalysis.timestamp());

            if (emotionAnalysis.keywords() != null) {
                node.putPOJO("keywords", emotionAnalysis.keywords());
            } else {
                node.putPOJO("keywords", List.of());
            }

            if (emotionAnalysis.improvementSuggestions() != null) {
                node.putPOJO("improvementSuggestions",
                        emotionAnalysis.improvementSuggestions());
            } else {
                node.putPOJO("improvementSuggestions", List.of());
            }

            String jsonStr = objectMapper.writeValueAsString(node);

            // Update DB
            try {
                consultationSessionService.updateLastEmotionAnalysis(dbSessionId, jsonStr);
            } catch (Exception e) {
                log.warn("Failed to update last emotion analysis in DB", e);
            }

            log.info("Async emotion analysis finished, emotion={}, riskLevel={}",
                    emotionAnalysis.primaryEmotion(), emotionAnalysis.riskLevel());

        } catch (Exception e) {
            log.error("Async emotion analysis failed", e);
        }
    }

    // Clean markdown code blocks, backticks, etc., keep pure JSON
    private String cleanJsonString(String text) {
        if (text == null) return "";

        return text
                .replace("```json", "")
                .replace("```", "")
                .replace("`", "")
                .trim();
    }


}
