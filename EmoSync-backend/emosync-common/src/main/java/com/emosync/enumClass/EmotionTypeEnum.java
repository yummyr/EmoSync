package com.emosync.enumClass;

import lombok.Getter;

/**
 * Emotion Type Enum
 * Standardized emotion classification for AI emotion analysis
 */
@Getter
public enum EmotionTypeEnum {

    // ========== Positive Emotions ==========
    HAPPY("Happy", "positive", "😊", "Positive and joyful emotional state", "#FBBF24"),
    EXCITED("Excited", "positive", "😄", "Full of vitality and passion", "#F59E0B"),
    GRATEFUL("Grateful", "positive", "🥺", "Feeling of gratitude towards others or things", "#34D399"),
    LOVE("Love", "positive", "❤️", "Affection and love for people or things", "#34D399"),
    SATISFIED("Satisfied", "positive", "😌", "Satisfaction and comfort with current situation", "#10B981"),
    PEACEFUL("Peaceful", "positive", "🙂", "Inner peace and tranquility state", "#60A5FA"),
    HOPEFUL("Hopeful", "positive", "✨", "Positive expectations for the future", "#A78BFA"),

    // ========== Negative Emotions ==========
    ANGRY("Angry", "negative", "😠", "Strong dissatisfaction and hostility", "#DC2626"),
    SAD("Sad", "negative", "😢", "Inner pain and loss", "#EF4444"),
    ANXIOUS("Anxious", "negative", "😰", "Worry and unease about the future", "#F59E0B"),
    FEARFUL("Fearful", "negative", "😨", "Fear of danger or threats", "#7C3AED"),
    DISAPPOINTED("Disappointed", "negative", "😞", "Sense of loss from unmet expectations", "#F472B6"),
    LONELY("Lonely", "negative", "😶", "Loneliness from lack of companionship and understanding", "#8B5CF6"),
    TROUBLED("Troubled", "negative", "😔", "Inner troubles and worries", "#F472B6"),
    DESPERATE("Desperate", "negative", "😵", "Extreme pain from complete loss of hope", "#991B1B"),

    // ========== Neutral Emotions ==========
    CONFUSED("Confused", "neutral", "🤔", "Lack of understanding and confusion about things", "#6B7280"),
    BORED("Bored", "neutral", "😐", "State lacking interest and stimulation", "#9CA3AF"),
    THOUGHTFUL("Thoughtful", "neutral", "💭", "State of deep thinking and reflection", "#64748B"),
    NOSTALGIC("Nostalgic", "neutral", "🧠", "Recollection and nostalgia for the past", "#71717A");
    
    /**
     * Emotion name
     */
    private final String emotionName;

    /**
     * Emotion category: positive, negative, neutral
     */
    private final String category;

    /**
     * Emotion icon
     */
    private final String icon;

    /**
     * Emotion description
     */
    private final String description;

    /**
     * Emotion color (for 3D visualization)
     */
    private final String color;

    EmotionTypeEnum(String emotionName, String category, String icon, String description, String color) {
        this.emotionName = emotionName;
        this.category = category;
        this.icon = icon;
        this.description = description;
        this.color = color;
    }

    /**
     * Get enum by emotion name
     *
     * @param emotionName Emotion name
     * @return Corresponding enum, returns null if not found
     */
    public static EmotionTypeEnum getByEmotionName(String emotionName) {
        if (emotionName == null || emotionName.trim().isEmpty()) {
            return null;
        }

        for (EmotionTypeEnum emotion : values()) {
            if (emotion.getEmotionName().equals(emotionName.trim())) {
                return emotion;
            }
        }
        return null;
    }

    /**
     * Check if it's a positive emotion
     *
     * @return true- positive emotion, false- not positive emotion
     */
    public boolean isPositive() {
        return "positive".equals(this.category);
    }

    /**
     * Check if it's a negative emotion
     *
     * @return true- negative emotion, false- not negative emotion
     */
    public boolean isNegative() {
        return "negative".equals(this.category);
    }

    /**
     * Check if it's a neutral emotion
     *
     * @return true- neutral emotion, false- not neutral emotion
     */
    public boolean isNeutral() {
        return "neutral".equals(this.category);
    }

    /**
     * Get all positive emotion name list
     *
     * @return Positive emotion name array
     */
    public static String[] getPositiveEmotions() {
        return new String[]{"Happy", "Excited", "Grateful", "Love", "Satisfied", "Peaceful", "Hopeful"};
    }

    /**
     * Get all negative emotion name list
     *
     * @return Negative emotion name array
     */
    public static String[] getNegativeEmotions() {
        return new String[]{"Angry", "Sad", "Anxious", "Fearful", "Disappointed", "Lonely", "Troubled", "Desperate"};
    }

    /**
     * Get all neutral emotion name list
     *
     * @return Neutral emotion name array
     */
    public static String[] getNeutralEmotions() {
        return new String[]{"Confused", "Bored", "Thoughtful", "Nostalgic"};
    }

    /**
     * Get all emotion name list
     *
     * @return All emotion name array
     */
    public static String[] getAllEmotionNames() {
        EmotionTypeEnum[] emotions = values();
        String[] names = new String[emotions.length];
        for (int i = 0; i < emotions.length; i++) {
            names[i] = emotions[i].getEmotionName();
        }
        return names;
    }

    /**
     * Get color by emotion name
     *
     * @param emotionName Emotion name
     * @return Corresponding color value, returns default color if not found
     */
    public static String getColorByType(String emotionName) {
        EmotionTypeEnum emotion = getByEmotionName(emotionName);
        return emotion != null ? emotion.getColor() : "#6B7280"; // Default gray
    }
}
