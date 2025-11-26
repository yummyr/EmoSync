package com.emosync.AiService;

import java.util.List;

/**
 * Standardized structured output definitions used by AI services,
 * including content auditing, emotion analysis, sensitive-word detection,
 * streaming chat sessions, and external AI integration formats.
 *
 * All structures are defined using Java Record (immutable and concise).
 *
 * Author: system
 */
public class StructOutPut {

    // -------------------------------------------------------------
    //  Content Moderation Result
    // -------------------------------------------------------------

    /**
     * Content moderation result.
     *
     * @param isPass Whether the content passes the moderation
     * @param riskLevel Risk level: 0-Safe, 1-Low, 2-Medium, 3-High
     * @param violationTypes List of violation categories (e.g. Porn, Violence)
     * @param riskScore Risk score (0.0–1.0)
     * @param suggestion Moderation suggestion (pass / manual-review / block)
     * @param reason Reason for the decision
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
     * @param primaryEmotion Main detected emotion
     * @param emotionScore Intensity 0–100
     * @param isNegative Whether the emotion is negative
     * @param riskLevel Psychological risk level (0-3)
     * @param keywords Extracted emotion keywords
     * @param suggestion Professional suggestions
     * @param icon Emoji icon
     * @param label Readable emotion label
     * @param riskDescription Risk explanation
     * @param improvementSuggestions Recommended improvements
     * @param timestamp Timestamp of analysis
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
            long timestamp
    ) {}


    // -------------------------------------------------------------
    //  Sensitive Word Detection
    // -------------------------------------------------------------

    /**
     * Sensitive word detection result.
     *
     * @param hasSensitiveWords Whether sensitive words exist
     * @param sensitiveWords Detected sensitive words
     * @param severity Severity level (low / medium / high)
     * @param filteredContent Content after replacement
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
     * @param sessionId Session ID
     * @param userHash User identifier
     * @param initialMessage First message in session
     * @param startTime Start timestamp
     * @param expiryTime Expiration timestamp
     * @param status Session status (ACTIVE / ENDED)
     * @param emotionHistory Past emotion analysis results
     * @param messageCount Total messages in session
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
     * @param action Operation type: START / CONTINUE / END
     * @param sessionId Session ID
     * @param userMessage User message (required in CONTINUE)
     * @param contextLimit Max messages kept in memory
     */
    public record SessionManagementRequest(
            String action,
            String sessionId,
            String userMessage,
            Integer contextLimit
    ) {}


    // -------------------------------------------------------------
    //  Aliyun Chatbot Integration
    // -------------------------------------------------------------

    /** Access token for Aliyun streaming chatbot API */
    public record AliyunChatbotAccessToken(
            String accessToken,
            String channelId,
            Long expiresAt
    ) {}

    /** Aliyun chatbot request parameters */
    public record AliyunChatbotRequest(
            String instanceId,
            String utterance,
            String sessionId,
            String senderId,
            String senderNick,
            String vendorParam,
            List<String> perspective,
            Boolean sandBox,
            String command
    ) {}

    /** Aliyun chatbot response wrapper */
    public record AliyunChatbotResponse(
            String messageId,
            String sessionId,
            String sequenceId,
            String source,
            Boolean streamEnd,
            AliyunMessageBody messageBody
    ) {}

    /** Aliyun response message body */
    public record AliyunMessageBody(
            String type,
            AliyunDirectMessageBody directMessageBody,
            AliyunClarifyMessageBody clarifyMessageBody,
            Object commands
    ) {}

    /** Direct response message body */
    public record AliyunDirectMessageBody(
            String contentType,
            List<AliyunSentence> sentenceList,
            String hitSystemAskConfig,
            Object answerReference,
            Object ext,
            List<Object> relatedQuestionList
    ) {}

    /** Clarification-style response body */
    public record AliyunClarifyMessageBody(
            String clarifyContent,
            String title,
            List<Object> clarifyList
    ) {}

    /** Aliyun response sentence */
    public record AliyunSentence(
            String content,
            Integer referNumber
    ) {}
}
