package com.emosync.ai;

import java.util.List;

/**
 * Standardized structured output definitions used by AI services,
 * including content auditing, emotion analysis, sensitive-word detection,
 * streaming chat sessions, external AI integration formats,
 * breathing exercises, and emotion trend results.
 *
 * All structures are defined using Java Record (immutable and concise).
 */
public class AiStructuredOutput {

    // -------------------------------------------------------------
    //  Content Moderation Result
    // -------------------------------------------------------------

    /**
     * Content moderation result.
     *
     * @param isPass         Whether the content passes the moderation
     * @param riskLevel      Risk level: 0-Safe, 1-Low, 2-Medium, 3-High
     * @param violationTypes List of violation categories (e.g. Porn, Violence)
     * @param riskScore      Risk score (0.0–1.0)
     * @param suggestion     Moderation suggestion (pass / manual-review / block)
     * @param reason         Reason for the decision
     */
    public record ContentAuditResult(
            boolean isPass,
            int riskLevel,
            List<String> violationTypes,
            double riskScore,
            String suggestion,
            String reason
    ) {}


    // -------------------------------------------------------------
    //  Emotion Analysis Result
    // -------------------------------------------------------------

    /**
     * Emotion analysis result.
     *
     * @param primaryEmotion         Main detected emotion
     * @param emotionScore           Intensity 0–100
     * @param isNegative             Whether the emotion is negative
     * @param riskLevel              Psychological risk level (0-3)
     * @param keywords               Extracted emotion keywords
     * @param suggestion             Professional suggestions
     * @param icon                   Emoji icon
     * @param label                  Readable emotion label
     * @param riskDescription        Risk explanation
     * @param improvementSuggestions Recommended improvements
     * @param timestamp              Timestamp of analysis
     */
    public record EmotionAnalysisResult(
            String primaryEmotion,
            int emotionScore,
            boolean isNegative,
            int riskLevel,
            List<String> keywords,
            String suggestion,
            String icon,
            String label,
            String riskDescription,
            List<String> improvementSuggestions,
            String timestamp
    ) {}


    // -------------------------------------------------------------
    //  Sensitive Word Detection
    // -------------------------------------------------------------

    /**
     * Sensitive word detection result.
     *
     * @param hasSensitiveWords Whether sensitive words exist
     * @param sensitiveWords    Detected sensitive words
     * @param severity          Severity level (low / medium / high)
     * @param filteredContent   Content after replacement
     */
    public record SensitiveWordResult(
            boolean hasSensitiveWords,
            List<String> sensitiveWords,
            String severity,
            String filteredContent
    ) {}


    // -------------------------------------------------------------
    //  Streamed Psychological Counseling Session
    // -------------------------------------------------------------

    /**
     * Streamed psychological support session.
     *
     * @param sessionId      Session ID
     * @param userHash       User identifier
     * @param initialMessage First message in session
     * @param startTime      Start timestamp
     * @param expiryTime     Expiration timestamp
     * @param status         Session status (ACTIVE / ENDED)
     * @param emotionHistory Past emotion analysis results
     * @param messageCount   Total messages in session
     */
    public record StreamChatSession(
            String sessionId,
            Long userHash,
            String initialMessage,
            Long startTime,
            Long expiryTime,
            String status,
            List<EmotionAnalysisResult> emotionHistory,
            Integer messageCount
    ) {}


    // -------------------------------------------------------------
    //  Session Management
    // -------------------------------------------------------------

    /**
     * Unified session operation for start / continue / end.
     *
     * @param action        Operation type: START / CONTINUE / END
     * @param sessionId     Session ID
     * @param userMessage   User message (required in CONTINUE)
     * @param contextLimit  Max messages kept in memory
     */
    public record SessionManagementRequest(
            String action,
            String sessionId,
            String userMessage,
            Integer contextLimit
    ) {}



    // -------------------------------------------------------------
    //  Breathing / Grounding Exercise  (used by Tools.triggerBreathingGuide)
    // -------------------------------------------------------------

    /**
     * A single step in a breathing or grounding exercise.
     *
     * @param label           Step label shown to the user, e.g. "Inhale", "See"
     * @param durationSeconds Timer duration in seconds; 0 = no countdown (grounding steps)
     * @param instruction     Guidance text for this step
     */
    public record BreathingStep(
            String label,
            int durationSeconds,
            String instruction
    ) {}

    /**
     * A complete breathing or grounding exercise guide.
     *
     * @param name         Exercise name, e.g. "Box Breathing"
     * @param description  Short description of the technique and its benefit
     * @param steps        Ordered list of steps the user follows
     * @param repeatCycles How many times to repeat the full cycle
     * @param closingNote  Reassuring note shown to the user after completing
     */
    public record BreathingExercise(
            String name,
            String description,
            List<BreathingStep> steps,
            int repeatCycles,
            String closingNote
    ) {}


    // -------------------------------------------------------------
    //  Emotion Trend Result  (used by Tools.getUserEmotionTrend)
    // -------------------------------------------------------------

    /**
     * Aggregated emotion trend derived from EmotionDiary records.
     *
     * @param userId           User this trend belongs to
     * @param daysAnalysed     How many days were looked back
     * @param dominantEmotions Emotions ranked by frequency, most common first (max 5)
     * @param topEmotion       Single most frequently occurring emotion
     * @param avgRiskLevel     Average risk level derived from mood scores (0–3)
     * @param trendDirection   IMPROVING | STABLE | WORSENING | NO_DATA | ERROR
     * @param snapshotCount    Number of diary entries found in the window
     * @param summary          Human-readable one-sentence summary for Sunny to use in greeting
     * @param generatedAt      ISO-8601 timestamp of when this trend was computed
     */
    public record EmotionTrendResult(
            Long userId,
            int daysAnalysed,
            List<String> dominantEmotions,
            String topEmotion,
            int avgRiskLevel,
            String trendDirection,
            int snapshotCount,
            String summary,
            String generatedAt
    ) {}
}
