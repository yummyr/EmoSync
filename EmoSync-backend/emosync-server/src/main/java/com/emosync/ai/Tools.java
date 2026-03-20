package com.emosync.ai;

import com.emosync.entity.*;
import com.emosync.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

/**
 * EmoSync Tool Calling — all methods annotated with @Tool are exposed to the LLM.
 *
 * The model decides autonomously when to invoke each tool based on conversation context.
 * Wired into ChatClient via .defaultTools(tools) in ChatClientConfig.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class Tools {

    private final ConsultationSessionRepository consultationSessionRepository;
    private final ConsultationMessageRepository consultationMessageRepository;
    private final EmotionDiaryRepository        emotionDiaryRepository;
    private final KnowledgeArticleRepository    knowledgeArticleRepository;
    private final KnowledgeCategoryRepository   knowledgeCategoryRepository;
    private final UserRepository                userRepository;


    // =========================================================================
    // Tool 1 — Crisis alert
    // Triggered: riskLevel >= 2, suicidal/self-harm language detected
    // =========================================================================

    @Tool(description =
            "Flag a psychological crisis in the database and alert the support team. " +
            "Call this immediately when the user expresses suicidal thoughts, self-harm " +
            "intentions, extreme hopelessness, or when riskLevel is 2 (warning) or 3 (crisis). " +
            "Do NOT wait — call this as soon as crisis signals appear.")
    @Transactional
    public String notifyCrisisTeam(
            @ToolParam(description = "The user's numeric ID") Long userId,
            @ToolParam(description = "The session ID string, e.g. session_42") String sessionId,
            @ToolParam(description = "Risk level: 2 = warning, 3 = crisis") int riskLevel,
            @ToolParam(description = "One-sentence reason, e.g. 'User expressed suicidal ideation'") String reason
    ) {
        log.warn("🚨 CRISIS ALERT — userId={}, sessionId={}, riskLevel={}, reason={}",
                userId, sessionId, riskLevel, reason);

        try {
            Long dbSessionId = extractDbSessionId(sessionId);

            // 1. Persist a crisis-flagged AI message in the session so admins can see it
            if (dbSessionId != null) {
                ConsultationSession session = consultationSessionRepository
                        .findById(dbSessionId).orElse(null);

                if (session != null) {
                    // Build a system-level crisis message visible in message history
                    ConsultationMessage crisisFlag = ConsultationMessage.builder()
                            .session(session)
                            .senderType(0)          // 0 = system
                            .messageType(99)        // 99 = crisis flag — add to your enum
                            .content("[CRISIS ALERT] riskLevel=" + riskLevel + " | " + reason)
                            .emotionTag("CRISIS")
                            .aiModel("system")
                            .build();
                    consultationMessageRepository.save(crisisFlag);

                    // 2. Force-update session's lastEmotionAnalysis with crisis marker
                    String crisisJson = String.format(
                            "{\"riskLevel\":%d,\"crisisFlag\":true,\"reason\":\"%s\",\"timestamp\":\"%s\"}",
                            riskLevel, reason, Instant.now());
                    session.setLastEmotionAnalysis(crisisJson);
                    session.setLastEmotionUpdatedAt(LocalDateTime.now());
                    consultationSessionRepository.save(session);

                    log.warn("Crisis flag persisted — sessionId={}, messageId={}",
                            dbSessionId, crisisFlag.getId());
                }
            }

            // 3. Log for external alerting (hook your NotificationService / webhook here)
            log.error("🚨 [CRISIS] userId={} | riskLevel={} | reason={} | time={}",
                    userId, riskLevel, reason, LocalDateTime.now());

            return String.format(
                    "{\"status\":\"CRISIS_FLAGGED\",\"userId\":%d,\"riskLevel\":%d," +
                    "\"sessionId\":\"%s\",\"timestamp\":\"%s\"}",
                    userId, riskLevel, sessionId, Instant.now());

        } catch (Exception e) {
            log.error("Failed to persist crisis alert", e);
            return "{\"status\":\"ERROR\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }


    // =========================================================================
    // Tool 2 — Emotion snapshot logger
    // Triggered: notable emotional shift detected mid-conversation
    // =========================================================================

    @Tool(description =
            "Persist a real-time emotion snapshot by updating the current session's " +
            "lastEmotionAnalysis field in the database. " +
            "Call this when you detect a meaningful emotion in the user's message — " +
            "especially negative emotions or a clear shift from the previous state. " +
            "Do NOT call on every message, only on significant emotional moments.")
    @Transactional
    public String saveEmotionSnapshot(
            @ToolParam(description = "The session ID string, e.g. session_42") String sessionId,
            @ToolParam(description = "Primary emotion detected, e.g. anxious, sad, hopeful") String primaryEmotion,
            @ToolParam(description = "Emotion intensity score 0–100") int emotionScore,
            @ToolParam(description = "Psychological risk level: 0=normal 1=mild 2=warning 3=crisis") int riskLevel,
            @ToolParam(description = "true if the emotion is negative") boolean isNegative
    ) {
        log.info("Saving emotion snapshot — session={}, emotion={}, score={}, risk={}",
                sessionId, primaryEmotion, emotionScore, riskLevel);

        try {
            Long dbSessionId = extractDbSessionId(sessionId);
            if (dbSessionId == null) {
                return "{\"status\":\"ERROR\",\"message\":\"Invalid sessionId\"}";
            }

            ConsultationSession session = consultationSessionRepository
                    .findById(dbSessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found: " + dbSessionId));

            // Build JSON and persist into ConsultationSession.lastEmotionAnalysis
            String snapshotJson = String.format(
                    "{\"primaryEmotion\":\"%s\",\"emotionScore\":%d,\"isNegative\":%b," +
                    "\"riskLevel\":%d,\"timestamp\":\"%s\"}",
                    primaryEmotion, emotionScore, isNegative, riskLevel, Instant.now());

            session.setLastEmotionAnalysis(snapshotJson);
            session.setLastEmotionUpdatedAt(LocalDateTime.now());
            consultationSessionRepository.save(session);

            // Also tag the latest user message with the emotion
            List<ConsultationMessage> recent = consultationMessageRepository
                    .findLatestBySessionId(dbSessionId, PageRequest.of(0, 1));
            if (!recent.isEmpty()) {
                ConsultationMessage msg = recent.get(0);
                msg.setEmotionTag(primaryEmotion);
                consultationMessageRepository.save(msg);
            }

            log.info("Emotion snapshot saved — sessionId={}, emotion={}", dbSessionId, primaryEmotion);

            return String.format(
                    "{\"status\":\"SAVED\",\"sessionId\":\"%s\",\"primaryEmotion\":\"%s\"," +
                    "\"riskLevel\":%d,\"timestamp\":\"%s\"}",
                    sessionId, primaryEmotion, riskLevel, Instant.now());

        } catch (Exception e) {
            log.error("Failed to save emotion snapshot", e);
            return "{\"status\":\"ERROR\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }


    // =========================================================================
    // Tool 3 — Coping resource recommender
    // Triggered: user needs help, distress detected, riskLevel >= 1
    // =========================================================================

    @Tool(description =
            "Fetch published knowledge articles from the database that match the user's " +
            "current emotional state. Returns titles, summaries, and IDs for up to 3 articles. " +
            "Call this when the user seems to need practical help, asks 'what can I do', " +
            "or when you want to back up your suggestion with real reading material.")
    public List<Map<String, String>> getCopingResources(
            @ToolParam(description = "Primary emotion keyword, e.g. anxious, depressed, angry, lonely, stress") String primaryEmotion
    ) {
        log.info("Fetching coping resources — emotion={}", primaryEmotion);

        try {
            // Map emotion to category codes stored in knowledge_category.category_code
            String categoryCode = mapEmotionToCategoryCode(primaryEmotion);

            // Try to find a matching category first
            List<KnowledgeCategory> categories = knowledgeCategoryRepository.findAllEnabled();

            Optional<KnowledgeCategory> matchedCategory = categories.stream()
                    .filter(c -> c.getCategoryCode() != null &&
                                 c.getCategoryCode().toLowerCase().contains(categoryCode))
                    .findFirst();

            List<KnowledgeArticle> articles;

            if (matchedCategory.isPresent()) {
                // Fetch published articles in the matched category (status=1), limit 3
                articles = knowledgeArticleRepository
                        .findByCategoryIdOrderByPublishedAtDesc(matchedCategory.get().getId())
                        .stream()
                        .filter(a -> Integer.valueOf(1).equals(a.getStatus()))
                        .limit(3)
                        .toList();
            } else {
                // Fallback: fetch 3 latest published articles across all categories
                articles = knowledgeArticleRepository
                        .findAll(PageRequest.of(0, 3))
                        .getContent()
                        .stream()
                        .filter(a -> Integer.valueOf(1).equals(a.getStatus()))
                        .toList();
            }

            if (articles.isEmpty()) {
                log.info("No articles found for emotion={}, returning default advice", primaryEmotion);
                return List.of(Map.of(
                        "type",    "advice",
                        "title",   "General Wellness Tips",
                        "summary", "Try deep breathing, journaling, or a short walk.",
                        "id",      ""
                ));
            }

            return articles.stream().map(a -> Map.of(
                    "type",    "article",
                    "id",      a.getId(),
                    "title",   a.getTitle() != null    ? a.getTitle()   : "",
                    "summary", a.getSummary() != null  ? a.getSummary() : "",
                    "tags",    a.getTags() != null      ? a.getTags()    : ""
            )).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to fetch coping resources", e);
            return List.of(Map.of("type", "error", "message", e.getMessage()));
        }
    }


    // =========================================================================
    // Tool 4 — Session diary summarizer
    // Triggered: user says goodbye / session naturally concluding
    // =========================================================================

    @Tool(description =
            "Generate a structured diary summary when the session is ending and persist it " +
            "by updating the session's lastEmotionAnalysis with a summary marker. " +
            "Call this when the user says goodbye, thank you, or clearly signals they are done. " +
            "Summarise emotional themes and any progress made.")
    @Transactional
    public String generateDiarySummary(
            @ToolParam(description = "Session ID string, e.g. session_42") String sessionId,
            @ToolParam(description = "Key emotional themes from this session, comma-separated") String emotionalThemes,
            @ToolParam(description = "Overall risk level observed: 0–3") int overallRiskLevel,
            @ToolParam(description = "One or two key insights or progress points this session") String keyInsights
    ) {
        log.info("Generating diary summary — sessionId={}, themes={}", sessionId, emotionalThemes);

        try {
            Long dbSessionId = extractDbSessionId(sessionId);
            if (dbSessionId == null) {
                return "{\"status\":\"ERROR\",\"message\":\"Invalid sessionId\"}";
            }

            ConsultationSession session = consultationSessionRepository
                    .findById(dbSessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found: " + dbSessionId));

            // Count total messages in this session
            long messageCount = consultationMessageRepository.countBySessionId(dbSessionId);

            // Build summary JSON
            String summaryJson = String.format(
                    "{\"type\":\"SESSION_SUMMARY\",\"emotionalThemes\":\"%s\"," +
                    "\"overallRiskLevel\":%d,\"keyInsights\":\"%s\"," +
                    "\"messageCount\":%d,\"summarisedAt\":\"%s\"}",
                    emotionalThemes, overallRiskLevel, keyInsights,
                    messageCount, Instant.now());

            session.setLastEmotionAnalysis(summaryJson);
            session.setLastEmotionUpdatedAt(LocalDateTime.now());
            consultationSessionRepository.save(session);

            // Save an AI farewell message tagged as SUMMARY
            ConsultationMessage summaryMsg = ConsultationMessage.builder()
                    .session(session)
                    .senderType(2)          // 2 = AI assistant
                    .messageType(2)         // 2 = summary — align with your enum
                    .content("[Session Summary] Themes: " + emotionalThemes +
                             " | Insights: " + keyInsights)
                    .emotionTag("SUMMARY")
                    .aiModel("session-summariser")
                    .build();
            consultationMessageRepository.save(summaryMsg);

            log.info("Session summary saved — sessionId={}", dbSessionId);

            return String.format(
                    "{\"status\":\"SAVED\",\"sessionId\":\"%s\",\"messageCount\":%d," +
                    "\"overallRiskLevel\":%d,\"summarisedAt\":\"%s\"}",
                    sessionId, messageCount, overallRiskLevel, Instant.now());

        } catch (Exception e) {
            log.error("Failed to generate diary summary", e);
            return "{\"status\":\"ERROR\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }


    // =========================================================================
    // Tool 5 — Breathing exercise guide
    // Triggered: acute anxiety, panic, or user asks to calm down
    // =========================================================================

    @Tool(description =
            "Return a step-by-step breathing or grounding exercise guide. " +
            "Call this when the user expresses acute anxiety, panic, overwhelm, or says " +
            "'help me calm down', 'I can't breathe', 'I'm panicking', or similar. " +
            "Choose the exercise type based on intensity: BOX_BREATHING for general anxiety, " +
            "FOUR_SEVEN_EIGHT for moderate anxiety, GROUNDING_5_4_3_2_1 for dissociation or panic.")
    public AiStructuredOutput.BreathingExercise triggerBreathingGuide(
            @ToolParam(description = "Exercise type: BOX_BREATHING | FOUR_SEVEN_EIGHT | GROUNDING_5_4_3_2_1") String exerciseType
    ) {
        log.info("Triggering breathing guide — type={}", exerciseType);

        return switch (exerciseType.toUpperCase()) {

            case "FOUR_SEVEN_EIGHT" -> new AiStructuredOutput.BreathingExercise(
                    "4-7-8 Breathing",
                    "A calming technique to slow your nervous system quickly.",
                    List.of(
                            new AiStructuredOutput.BreathingStep("Inhale", 4, "Breathe in quietly through your nose for 4 seconds"),
                            new AiStructuredOutput.BreathingStep("Hold",   7, "Hold your breath for 7 seconds"),
                            new AiStructuredOutput.BreathingStep("Exhale", 8, "Exhale completely through your mouth for 8 seconds")
                    ),
                    4,
                    "You're doing great. Repeat up to 4 cycles. Works best sitting upright."
            );

            case "GROUNDING_5_4_3_2_1" -> new AiStructuredOutput.BreathingExercise(
                    "5-4-3-2-1 Grounding",
                    "A sensory exercise to anchor you firmly in the present moment.",
                    List.of(
                            new AiStructuredOutput.BreathingStep("See",   0, "Look around and name 5 things you can see right now"),
                            new AiStructuredOutput.BreathingStep("Touch", 0, "Notice 4 things you can physically feel"),
                            new AiStructuredOutput.BreathingStep("Hear",  0, "Listen for 3 sounds around you"),
                            new AiStructuredOutput.BreathingStep("Smell", 0, "Identify 2 things you can smell"),
                            new AiStructuredOutput.BreathingStep("Taste", 0, "Notice 1 thing you can taste")
                    ),
                    1,
                    "Go slowly. There is no rush. You are safe here."
            );

            default -> new AiStructuredOutput.BreathingExercise(  // BOX_BREATHING
                    "Box Breathing",
                    "A simple equal-count technique used by therapists and athletes alike.",
                    List.of(
                            new AiStructuredOutput.BreathingStep("Inhale", 4, "Breathe in slowly through your nose"),
                            new AiStructuredOutput.BreathingStep("Hold",   4, "Hold gently"),
                            new AiStructuredOutput.BreathingStep("Exhale", 4, "Breathe out slowly through your mouth"),
                            new AiStructuredOutput.BreathingStep("Hold",   4, "Rest before the next breath")
                    ),
                    4,
                    "Imagine tracing the sides of a square as you breathe. Repeat 4–6 cycles."
            );
        };
    }


    // =========================================================================
    // Tool 6 — Emotion trend analyser
    // Triggered: start of returning session, or user asks "how have I been"
    // =========================================================================

    @Tool(description =
            "Retrieve the user's emotion trend from their EmotionDiary records over the past N days. " +
            "Call this at the START of a new session (not a first-ever session) to personalise " +
            "Sunny's greeting, OR when the user asks 'how have I been lately', 'am I improving', " +
            "'what have my moods been like'. Returns dominant emotions, average mood score, and trend direction.")
    public AiStructuredOutput.EmotionTrendResult getUserEmotionTrend(
            @ToolParam(description = "The user's numeric ID") Long userId,
            @ToolParam(description = "Number of days to look back, e.g. 7 or 30") int days
    ) {
        log.info("Fetching emotion trend — userId={}, days={}", userId, days);

        try {
            LocalDate endDate   = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days);

            // Fetch diaries in range
            List<EmotionDiary> diaries = emotionDiaryRepository
                    .findByUserIdAndDiaryDateBetween(userId, startDate, endDate);

            if (diaries.isEmpty()) {
                return new AiStructuredOutput.EmotionTrendResult(
                        userId, days,
                        List.of(), "none",
                        0, "NO_DATA", 0,
                        "No diary entries found in the last " + days + " days.",
                        Instant.now().toString()
                );
            }

            // --- Dominant emotions (ranked by frequency) ---
            Map<String, Long> emotionCount = diaries.stream()
                    .filter(d -> d.getDominantEmotion() != null && !d.getDominantEmotion().isBlank())
                    .collect(Collectors.groupingBy(EmotionDiary::getDominantEmotion, Collectors.counting()));

            List<String> dominantEmotions = emotionCount.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .map(Map.Entry::getKey)
                    .limit(5)
                    .collect(Collectors.toList());

            String topEmotion = dominantEmotions.isEmpty() ? "neutral" : dominantEmotions.get(0);

            // --- Average mood score (moodScore 1–10, map to riskLevel 0–3) ---
            OptionalDouble avgMood = diaries.stream()
                    .filter(d -> d.getMoodScore() != null)
                    .mapToInt(EmotionDiary::getMoodScore)
                    .average();

            double avgMoodScore = avgMood.orElse(5.0);
            int avgRiskLevel = moodScoreToRiskLevel(avgMoodScore);

            // --- Trend: compare first half vs second half mood scores ---
            int mid = diaries.size() / 2;
            double firstHalfAvg  = diaries.subList(0, Math.max(mid, 1)).stream()
                    .filter(d -> d.getMoodScore() != null)
                    .mapToInt(EmotionDiary::getMoodScore).average().orElse(5.0);
            double secondHalfAvg = diaries.subList(Math.max(mid, 1), diaries.size()).stream()
                    .filter(d -> d.getMoodScore() != null)
                    .mapToInt(EmotionDiary::getMoodScore).average().orElse(5.0);

            String trend = secondHalfAvg > firstHalfAvg + 0.5 ? "IMPROVING"
                         : secondHalfAvg < firstHalfAvg - 0.5 ? "WORSENING"
                         : "STABLE";

            String summary = String.format(
                    "Over the past %d days, %s appears most frequently. " +
                    "Average mood score is %.1f/10. Trend: %s.",
                    days, topEmotion, avgMoodScore, trend);

            log.info("Emotion trend — userId={}, topEmotion={}, trend={}, avgMood={}",
                    userId, topEmotion, trend, avgMoodScore);

            return new AiStructuredOutput.EmotionTrendResult(
                    userId, days,
                    dominantEmotions, topEmotion,
                    avgRiskLevel, trend,
                    diaries.size(), summary,
                    Instant.now().toString()
            );

        } catch (Exception e) {
            log.error("Failed to fetch emotion trend for userId={}", userId, e);
            return new AiStructuredOutput.EmotionTrendResult(
                    userId, days,
                    List.of(), "error",
                    0, "ERROR", 0,
                    "Failed to retrieve trend: " + e.getMessage(),
                    Instant.now().toString()
            );
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Extract numeric DB ID from "session_42" → 42L */
    private Long extractDbSessionId(String sessionId) {
        try {
            if (sessionId != null && sessionId.startsWith("session_")) {
                return Long.parseLong(sessionId.substring("session_".length()));
            }
            return null;
        } catch (NumberFormatException e) {
            log.warn("Cannot parse sessionId: {}", sessionId);
            return null;
        }
    }

    /** Map emotion keyword to knowledge_category.category_code fragment */
    private String mapEmotionToCategoryCode(String emotion) {
        if (emotion == null) return "wellness";
        return switch (emotion.toLowerCase()) {
            case "anxious", "anxiety", "panic", "worry"         -> "anxiety";
            case "sad", "sadness", "grief", "depressed",
                 "depression", "hopeless"                        -> "depression";
            case "angry", "anger", "frustrated", "frustration"  -> "anger";
            case "lonely", "loneliness", "isolated"             -> "loneliness";
            case "stress", "stressed", "overwhelm", "burnout"   -> "stress";
            default                                              -> "wellness";
        };
    }

    /** Convert mood score (1–10) to risk level (0–3) */
    private int moodScoreToRiskLevel(double moodScore) {
        if (moodScore >= 7) return 0;
        if (moodScore >= 5) return 1;
        if (moodScore >= 3) return 2;
        return 3;
    }
}
