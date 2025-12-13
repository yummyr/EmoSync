package com.emosync.controller;

import com.emosync.Result.PageResult;
import com.emosync.security.UserDetailsImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.AiService.PsychologicalSupportService;
import com.emosync.DTO.command.ConsultationSessionCreateDTO;
import com.emosync.DTO.query.ConsultationSessionQueryDTO;
import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.DTO.response.ConsultationSessionResponseDTO;
import com.emosync.Result.Result;
import com.emosync.entity.ConsultationSession;
import com.emosync.enumClass.UserType;
import com.emosync.service.ConsultationMessageService;
import com.emosync.service.ConsultationSessionService;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import com.emosync.AiService.StructOutPut;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 流式心理疏导智能对话控制器
 * 提供基于Spring AI的流式心理疏导对话服务
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/psychological-chat")
@Tag(name = "Streaming Psychological Support", description = "AI-powered streaming psychological support chat service")
public class PsychologicalChatController {


    private final PsychologicalSupportService psychologicalSupportService;


    private final ConsultationSessionService consultationSessionService;

    private final ConsultationMessageService consultationMessageService;
    private final ObjectMapper objectMapper;

    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }
    /**
     * Get current user ID
     */
    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        log.info("userDetails.getId():{}",userDetails.getId());
        return userDetails != null ? userDetails.getId() : null;
    }
    /** Check if current user has ROLE_ADMIN */
    private boolean isAdmin() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        return userDetails != null && userDetails.isAdmin();
    }
    // /**
    //  * Convert object to SSE data format (JSON string)
    //  */
    // private String toSseData(Object data) {
    //     try {
    //         return objectMapper.writeValueAsString(data);
    //     } catch (JsonProcessingException e) {
    //         log.error("Failed to convert SSE data", e);
    //         return "{\"code\":500,\"message\":\"Data formatting failed\"}";
    //     }
    // }
    /**
     * Start a new psychological support session
     */
    @Operation(summary = "Start Chat Session", description = "Create a new psychological support chat session")
    @PostMapping("/session/start")
    public Result<Object> startChatSession(@RequestBody ConsultationSessionCreateDTO createDTO) {
        log.info("Received request to start psychological support session");

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            StructOutPut.StreamChatSession session =
                    psychologicalSupportService.startChatSession(userId, createDTO);

            log.info("Psychological support session created successfully, sessionId: {}",
                    session.sessionId());
            return Result.success("Session created successfully", session);

        } catch (Exception e) {
            log.error("Failed to start psychological support session", e);
            return Result.error("Failed to create session: " + e.getMessage());
        }
    }

    /**
     * Streaming psychological support chat
     */
    @Operation(summary = "Stream Chat", description = "Real-time streaming AI psychological support chat")
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(
            @RequestBody StreamChatRequest request) {
        log.info("Received streaming chat request, sessionId: {}", request.sessionId());

        try {
            // Validate user authentication
            Long userId = getCurrentUserId();
            if (userId == null) {
                log.error("User not logged in");
                return Flux.just(createErrorEvent("User not logged in"));
            }

            // Validate session ownership
            Long dbSessionId = psychologicalSupportService.extractSessionId(request.sessionId());
            if (dbSessionId == null) {
                return Flux.just(createErrorEvent("Invalid session ID format"));
            }

            ConsultationSession session = consultationSessionService.getSessionById(dbSessionId);
            if (session == null) {
                return Flux.just(createErrorEvent("Session not found"));
            }


            if (!session.getUser().getId().equals(userId)) {
                return Flux.just(createErrorEvent("Unauthorized access to this session"));
            }

            // Start streaming chat
            return psychologicalSupportService.streamPsychologicalChat(
                            request.sessionId(),
                            request.userMessage()
                    )
                    .map(fragment -> createMessageEvent(fragment))
                    .doOnSubscribe(subscription -> {
                        log.info("Started streaming chat, sessionId: {}", request.sessionId());
                    })
                    .doOnComplete(() -> {
                        log.info("Streaming chat completed, sessionId: {}", request.sessionId());
                    })
                    .doOnError(error -> {
                        log.error("Streaming chat error", error);
                    })
                    .onErrorResume(error ->
                            Flux.just(createErrorEvent("Chat service error: " + error.getMessage()))
                    )
                    .concatWith(Flux.just(createDoneEvent()))
                    .delayElements(Duration.ofMillis(30));

        } catch (Exception e) {
            log.error("Failed to initialize streaming chat", e);
            return Flux.just(createErrorEvent("Chat initialization failed: " + e.getMessage()));
        }
    }

    /**
     * End chat session
     */
    @Operation(summary = "End Chat Session", description = "End the current chat session")
    @PostMapping("/session/end")
    public Result<Boolean> endChatSession(
            @Parameter(description = "Session ID") @RequestParam String sessionId,
            @Parameter(description = "Mood after session") @RequestParam(required = false) Integer moodAfter) {
        log.info("Received request to end session, sessionId: {}", sessionId);

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            // Validate session ownership
            Long dbSessionId = psychologicalSupportService.extractSessionId(sessionId);
            if (dbSessionId == null) {
                return Result.error("Invalid session ID format");
            }

            ConsultationSession session = consultationSessionService.getSessionById(dbSessionId);
            if (session == null) {
                return Result.error("Session not found");
            }

            if (!session.getUser().getId().equals(userId)) {
                return Result.error("Unauthorized access to this session");
            }

            boolean success = psychologicalSupportService.endChatSession(sessionId, moodAfter);

            if (success) {
                log.info("Session ended successfully, sessionId: {}", sessionId);
                return Result.success("Session ended successfully", true);
            } else {
                return Result.error("Failed to end session");
            }

        } catch (Exception e) {
            log.error("Failed to end chat session", e);
            return Result.error("Failed to end session: " + e.getMessage());
        }
    }

    /**
     * Get session emotion analysis result
     */
    @Operation(summary = "Get Session Emotion", description = "Get the latest emotion analysis for a session")
    @GetMapping("/session/{sessionId}/emotion")
    public Result<StructOutPut.EmotionAnalysisResult> getSessionEmotion(
            @PathVariable String sessionId) {
        log.info("Getting session emotion, sessionId: {}", sessionId);

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            Long dbSessionId = psychologicalSupportService.extractSessionId(sessionId);
            if (dbSessionId == null) {
                return Result.error("Invalid session ID format");
            }

            ConsultationSession session = consultationSessionService.getSessionById(dbSessionId);
            if (session == null) {
                return Result.error("Session not found");
            }

            if (!session.getUser().getId().equals(userId)) {
                return Result.error("Unauthorized access to this session");
            }

            StructOutPut.EmotionAnalysisResult emotionResult =
                    parseEmotionAnalysis(session.getLastEmotionAnalysis());

            log.info("Successfully retrieved session emotion: {}, riskLevel: {}",
                    emotionResult.primaryEmotion(), emotionResult.riskLevel());

            return Result.success(emotionResult);

        } catch (Exception e) {
            log.error("Failed to get session emotion", e);
            return Result.error("Failed to get emotion: " + e.getMessage());
        }
    }

    // ==================== Session Management APIs ====================

    /**
     * Get sessions with pagination
     */
    @Operation(summary = "Get Sessions Page", description = "Get paginated list of consultation sessions")
    @GetMapping("/sessions")
    public Result<PageResult<ConsultationSessionResponseDTO>> getSessionsPage(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Integer currentPage,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "用户ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "情绪标签") @RequestParam(required = false) String emotionTag,
            @Parameter(description = "开始时间起") @RequestParam(required = false) String startDate,
            @Parameter(description = "开始时间止") @RequestParam(required = false) String endDate,
            @Parameter(description = "关键词搜索") @RequestParam(required = false) String keyword) {

        // 构造查询DTO
        ConsultationSessionQueryDTO queryDTO = new ConsultationSessionQueryDTO();
        queryDTO.setCurrentPage(currentPage);
        queryDTO.setSize(size);
        queryDTO.setUserId(userId);
        queryDTO.setEmotionTag(emotionTag);
        queryDTO.setStartDate(startDate);
        queryDTO.setEndDate(endDate);
        queryDTO.setKeyword(keyword);

        log.info("Querying sessions page, query: {}", queryDTO);

        try {
            Long currentUserId = getCurrentUserId();

            // Permission control
            if (!isAdmin()) {
                // Regular users can only view their own sessions
                queryDTO.setUserId(currentUserId);
            }

            PageResult<ConsultationSessionResponseDTO> page =
                    consultationSessionService.selectPage(queryDTO);

            return Result.success(page);

        } catch (Exception e) {
            log.error("Failed to query sessions page", e);
            return Result.error("Failed to query sessions: " + e.getMessage());
        }
    }
    /**
     * Get session details
     */
    @Operation(summary = "Get Session Detail", description = "Get detailed information of a session")
    @GetMapping("/sessions/{sessionId}")
    public Result<ConsultationSessionResponseDTO> getSessionDetail(
            @PathVariable Long sessionId) {
        log.info("Getting session detail, sessionId: {}", sessionId);

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            ConsultationSessionResponseDTO session =
                    consultationSessionService.getSessionDetail(sessionId);

            // Permission check: only owner or admin can view
            if (!session.getUserId().equals(userId) && !isAdmin()) {
                return Result.error("Unauthorized access to this session");
            }

            return Result.success(session);

        } catch (Exception e) {
            log.error("Failed to get session detail", e);
            return Result.error("Failed to get session detail: " + e.getMessage());
        }
    }

    /**
     * Get session messages
     */
    @Operation(summary = "Get Session Messages", description = "Get all messages of a session")
    @GetMapping("/sessions/{sessionId}/messages")
    public Result<List<ConsultationMessageResponseDTO>> getSessionMessages(
            @PathVariable Long sessionId) {
        log.info("Getting session messages, sessionId: {}", sessionId);

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            // Verify session ownership
            ConsultationSession session = consultationSessionService.getSessionById(sessionId);
            if (session == null) {
                return Result.error("Session not found");
            }

            if (!session.getUser().getId().equals(userId) && !isAdmin()) {
                return Result.error("Unauthorized access to this session");
            }

            List<ConsultationMessageResponseDTO> messages =
                    consultationMessageService.getMessagesBySessionId(sessionId);

            return Result.success(messages);

        } catch (Exception e) {
            log.error("Failed to get session messages", e);
            return Result.error("Failed to get messages: " + e.getMessage());
        }
    }

    /**
     * Delete consultation session
     */
    @Operation(summary = "Delete Session", description = "Delete a consultation session and its messages")
    @DeleteMapping("/sessions/{sessionId}")
    public Result<Boolean> deleteSession(@PathVariable Long sessionId) {
        log.info("Deleting session, sessionId: {}", sessionId);

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            boolean success = consultationSessionService.deleteSession(sessionId);

            if (success) {
                log.info("Session deleted successfully, sessionId: {}", sessionId);
                return Result.success("Session deleted successfully", true);
            } else {
                return Result.error("Failed to delete session");
            }

        } catch (Exception e) {
            log.error("Failed to delete session", e);
            return Result.error("Failed to delete session: " + e.getMessage());
        }
    }

    /**
     * Update session title
     */
    @Operation(summary = "Update Session Title", description = "Update the title of a consultation session")
    @PutMapping("/sessions/{sessionId}/title")
    public Result<Boolean> updateSessionTitle(
            @PathVariable Long sessionId,
            @RequestBody UpdateSessionTitleRequest request) {
        log.info("Updating session title, sessionId: {}, newTitle: {}",
                sessionId, request.sessionTitle());

        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return Result.error("User not logged in");
            }

            boolean success = consultationSessionService.updateSessionTitle(
                    sessionId, userId, request.sessionTitle()
            );

            if (success) {
                log.info("Session title updated successfully, sessionId: {}", sessionId);
                return Result.success("Title updated successfully", true);
            } else {
                return Result.error("Failed to update title");
            }

        } catch (Exception e) {
            log.error("Failed to update session title", e);
            return Result.error("Failed to update title: " + e.getMessage());
        }
    }

    // ==================== Private Helper Methods ====================

    /**
     * Create SSE error event
     */
    private ServerSentEvent<String> createErrorEvent(String errorMessage) {
        Map<String, Object> errorData = new HashMap<>();
        errorData.put("code", 500);
        errorData.put("message", errorMessage);

        return ServerSentEvent.<String>builder()
                .event("error")
                .data(toSseData(Result.error(errorMessage)))
                .build();
    }

    /**
     * Create SSE message event
     */
    private ServerSentEvent<String> createMessageEvent(String fragment) {
        Map<String, Object> messageData = new HashMap<>();
        messageData.put("content", fragment);

        // Check if it's a risk warning
        if (fragment.contains("⚠️") || fragment.contains("💡")) {
            messageData.put("type", "risk");
            return ServerSentEvent.<String>builder()
                    .event("risk-warning")
                    .data(toSseData(Result.success(messageData)))
                    .build();
        } else {
            messageData.put("type", "normal");
            return ServerSentEvent.<String>builder()
                    .event("message")
                    .data(toSseData(Result.success(messageData)))
                    .build();
        }
    }

    /**
     * Create SSE done event
     */
    private ServerSentEvent<String> createDoneEvent() {
        return ServerSentEvent.<String>builder()
                .event("done")
                .data("{}")
                .build();
    }

    /**
     * Parse emotion analysis JSON to EmotionAnalysisResult
     */
    private StructOutPut.EmotionAnalysisResult parseEmotionAnalysis(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return psychologicalSupportService.getDefaultEmotionAnalysis();
        }

        try {
            Map<String, Object> emotionMap = objectMapper.readValue(jsonString, Map.class);

            return new StructOutPut.EmotionAnalysisResult(
                    (String) emotionMap.getOrDefault("primaryEmotion", "Neutral"),
                    ((Number) emotionMap.getOrDefault("emotionScore", 50)).intValue(),
                    (Boolean) emotionMap.getOrDefault("isNegative", false),
                    ((Number) emotionMap.getOrDefault("riskLevel", 0)).intValue(),
                    (List<String>) emotionMap.get("keywords"),
                    (String) emotionMap.getOrDefault("suggestion", "Stay calm"),
                    (String) emotionMap.getOrDefault("icon", "😐"),
                    (String) emotionMap.getOrDefault("label", "Calm"),
                    (String) emotionMap.getOrDefault("riskDescription", "Stable emotional state"),
                    (List<String>) emotionMap.getOrDefault("improvementSuggestions",
                            List.of("Maintain current state")),
                    ((Number) emotionMap.getOrDefault("timestamp", System.currentTimeMillis())).longValue()
            );
        } catch (Exception e) {
            log.warn("Failed to parse emotion analysis JSON, using default", e);
            return psychologicalSupportService.getDefaultEmotionAnalysis();
        }
    }

    // ==================== Request DTOs ====================

    /**
     * Stream chat request DTO
     */
    public record StreamChatRequest(
            @Parameter(description = "Session ID")
            String sessionId,

            @Parameter(description = "User message")
            String userMessage
    ) {}

    /**
     * Update session title request DTO
     */
    public record UpdateSessionTitleRequest(
            @Parameter(description = "New session title")
            String sessionTitle
    ) {}

    /**
     * Convert object to SSE data format (JSON string)
     */
    private String toSseData(Object data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert SSE data", e);
            return "{\"code\":500,\"message\":\"Data formatting failed\"}";
        }
    }
} 