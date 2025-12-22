/*

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Host           : localhost:3306
 Source Schema         : EmoSync_db

 Date: 21/12/2025  Update
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ai_analysis_task
-- ----------------------------
DROP TABLE IF EXISTS `ai_analysis_task`;
CREATE TABLE `ai_analysis_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Task ID',
  `diary_id` bigint NOT NULL COMMENT 'Diary ID',
  `user_id` bigint NOT NULL COMMENT 'User ID',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Task status: PENDING-pending, PROCESSING-processing, COMPLETED-completed, FAILED-failed',
  `task_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Task type: AUTO-auto trigger, MANUAL-manual trigger, ADMIN-admin trigger, BATCH-batch trigger',
  `priority` int NOT NULL DEFAULT 2 COMMENT 'Priority: 1-low, 2-normal, 3-high, 4-urgent',
  `retry_count` int NOT NULL DEFAULT 0 COMMENT 'Retry count',
  `max_retry_count` int NOT NULL DEFAULT 3 COMMENT 'Max retry count',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Error message',
  `started_at` datetime NULL DEFAULT NULL COMMENT 'Processing start time',
  `completed_at` datetime NULL DEFAULT NULL COMMENT 'Processing completion time',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_diary_id`(`diary_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_task_type`(`task_type` ASC) USING BTREE,
  INDEX `idx_priority`(`priority` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_status_priority`(`status` ASC, `priority` ASC) USING BTREE,
  INDEX `idx_status_created_at`(`status` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_task_type_created_at`(`task_type` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_retry_status`(`status` ASC, `retry_count` ASC, `max_retry_count` ASC) USING BTREE,
  CONSTRAINT `fk_ai_task_diary` FOREIGN KEY (`diary_id`) REFERENCES `emotion_diary` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ai_task_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI Analysis Task Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_analysis_task
-- ----------------------------
INSERT INTO `ai_analysis_task` VALUES (32, 8, 2, 'COMPLETED', 'AUTO', 2, 0, 3, NULL, '2025-09-14 09:42:34', '2025-09-14 09:42:44', '2025-09-14 09:42:34', '2025-09-14 09:42:44');
INSERT INTO `ai_analysis_task` VALUES (33, 8, 2, 'COMPLETED', 'AUTO', 2, 0, 3, NULL, '2025-09-14 14:04:32', '2025-09-14 14:04:37', '2025-09-14 14:04:32', '2025-09-14 14:04:37');
INSERT INTO `ai_analysis_task` VALUES (34, 5, 2, 'COMPLETED', 'ADMIN', 3, 0, 3, NULL, '2025-09-14 14:05:48', '2025-09-14 14:05:52', '2025-09-14 14:05:48', '2025-09-14 14:05:52');
INSERT INTO `ai_analysis_task` VALUES (35, 8, 2, 'COMPLETED', 'AUTO', 2, 0, 3, NULL, '2025-09-14 14:13:21', '2025-09-14 14:13:26', '2025-09-14 14:13:21', '2025-09-14 14:13:26');
INSERT INTO `ai_analysis_task` VALUES (36, 8, 2, 'COMPLETED', 'ADMIN', 3, 0, 3, NULL, '2025-09-14 14:14:21', '2025-09-14 14:14:45', '2025-09-14 14:14:21', '2025-09-14 14:14:45');

-- ----------------------------
-- Table structure for consultation_message
-- ----------------------------
DROP TABLE IF EXISTS `consultation_message`;
CREATE TABLE `consultation_message`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Message ID',
  `session_id` bigint NOT NULL COMMENT 'Session ID',
  `sender_type` tinyint NOT NULL COMMENT 'Sender type 1:User 2:AI Assistant',
  `message_type` tinyint NULL DEFAULT 1 COMMENT 'Message type 1:Text',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Message content',
  `emotion_tag` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Emotion tag',
  `ai_model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'AI model used',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_message`(`session_id` ASC, `created_at` ASC) USING BTREE,
  CONSTRAINT `consultation_message_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `consultation_session` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 104 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Consultation Message Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of consultation_message
-- ----------------------------
INSERT INTO `consultation_message` VALUES (98, 17, 1, 1, 'Hello, my name is Alex', NULL, NULL, '2025-11-14 14:11:53');
INSERT INTO `consultation_message` VALUES (99, 17, 2, 1, 'Hello Alex! 😊 Nice to meet you~ I am your mental health assistant, you can call me \"Warm Heart\" or \"Sunny\". How have you been lately? As a college student, do you have many things you want to share? 💬\n\nYou can talk to me about anything, whether it is academic pressure, interpersonal relationships, or some confusion and anxiety about the future... I am here listening carefully ✨', NULL, 'openai', '2025-09-14 14:11:58');
INSERT INTO `consultation_message` VALUES (100, 17, 1, 1, 'I got into graduate school, but I feel lost', NULL, NULL, '2025-11-14 14:12:09');
INSERT INTO `consultation_message` VALUES (101, 17, 2, 1, 'Congratulations on getting into graduate school, Alex! 🎉 This is really something to be proud of~ But hearing you say you feel lost, I completely understand that feeling😊\n\nGraduate school is indeed very different from undergraduate. Can you tell me more about where your confusion comes from? ✨ For example:\n1️⃣ Worried about too much academic pressure?\n2️⃣ Uncertain about research direction?\n3️⃣ Or confused about future career planning?\n\nYou know what? This kind of \"post-acceptance confusion\" is actually very common~ It\'s like standing at a new starting line, a normal reaction when there are too many possibilities in front of you🌟\n\nWould you like us to sort it out together? Take your time, I\'m listening💛', NULL, 'openai', '2025-11-14 14:12:19');
INSERT INTO `consultation_message` VALUES (102, 17, 1, 1, 'Can you give me some advice for graduate school?', NULL, NULL, '2025-11-14 14:12:29');
INSERT INTO `consultation_message` VALUES (103, 17, 2, 1, 'Of course, Alex! 🎓 As someone about to start graduate school, this advice might help you~ ✨\n\n🔍 **Academic Adaptation**:\n1️⃣ Contact your advisor proactively: You can send an email to your advisor before school starts to discuss research direction and study plans\n2️⃣ Develop literature management habits: Try Zotero/EndNote, build a literature database from day one\n3️⃣ Take academic notes weekly: Recording inspiration is much easier than recalling later\n\n💡 **Mindset Adjustment Tips**:\n- Allow yourself to be \"slow to warm up\" in the first semester⏳ Many people need 3-6 months to adapt to the rhythm\n- Break big goals into quarterly/monthly small goals, sense of achievement UP↑\n- Lab mates are your best comrades, share confusion and resources more\n\n👩💻 **Practical Small Tools**:\n✓ Pomodoro Technique APP (focus 25 minutes + 5 minutes rest)\n✓ Academic calendar to mark important nodes\n✓ Regularly backup research data! (blood and tears lesson warning)\n\nAlex noticed you mentioned confusion before, and I want to tell you specifically: It\'s really normal to feel lost in graduate school~🤗 Suggestions:\n- Attend more lab group meetings after school starts in September\n- Audit 1-2 courses in related fields\n- Have coffee with senior students to chat about experience\n\nRemember, graduate school is a marathon not a sprint🏃, finding your own rhythm is the most important thing! Which aspect do you want to start preparing for first? 💭', NULL, 'openai', '2025-11-14 14:12:47');

-- ----------------------------
-- Table structure for consultation_session
-- ----------------------------
DROP TABLE IF EXISTS `consultation_session`;
CREATE TABLE `consultation_session`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Session ID',
  `user_id` bigint NOT NULL COMMENT 'User ID',
  `session_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Session title',
  `started_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `last_emotion_analysis` json NULL COMMENT 'Last emotion analysis result (JSON format)',
  `last_emotion_updated_at` datetime NULL DEFAULT NULL COMMENT 'Last emotion analysis update time',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_session`(`user_id` ASC, `started_at` ASC) USING BTREE,
  INDEX `idx_last_emotion_updated_at`(`last_emotion_updated_at` ASC) USING BTREE,
  CONSTRAINT `consultation_session_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Consultation Session Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of consultation_session
-- ----------------------------
INSERT INTO `consultation_session` VALUES (17, 2, 'Warm Assistant - 9/11/2025, 2:11:52 PM', '2025-11-14 14:11:53', '{\"icon\": \"🤔\", \"label\": \"Curiosity\", \"keywords\": [\"advice\", \"curiosity\", \"preparation\", \"planning\", \"consultation\"], \"riskLevel\": 0, \"timestamp\": 1719216000000, \"isNegative\": false, \"suggestion\": \"Glad to provide graduate school advice for you\", \"emotionScore\": 45, \"primaryEmotion\": \"Thinking\", \"riskDescription\": \"Emotionally stable\", \"improvementSuggestions\": [\"List specific problem items\", \"Consult senior student experience\", \"Plan research direction\", \"Create study plan\"]}', '2025-11-14 14:12:35');

-- ----------------------------
-- Table structure for emotion_diary
-- ----------------------------
DROP TABLE IF EXISTS `emotion_diary`;
CREATE TABLE `emotion_diary`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Diary ID',
  `user_id` bigint NOT NULL COMMENT 'User ID',
  `diary_date` date NOT NULL COMMENT 'Diary date',
  `mood_score` tinyint NOT NULL COMMENT 'Mood score (1-10)',
  `dominant_emotion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Dominant emotion',
  `emotion_triggers` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Emotion triggers',
  `diary_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Diary content',
  `sleep_quality` tinyint NULL DEFAULT NULL COMMENT 'Sleep quality (1-5)',
  `stress_level` tinyint NULL DEFAULT NULL COMMENT 'Stress level (1-5)',
  `ai_emotion_analysis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'AI emotion analysis result (JSON format)',
  `ai_analysis_updated_at` datetime NULL DEFAULT NULL COMMENT 'AI analysis update time',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_date_unique`(`user_id` ASC, `diary_date` ASC) USING BTREE,
  INDEX `idx_user_diary`(`user_id` ASC, `diary_date` ASC) USING BTREE,
  INDEX `idx_ai_analysis_time`(`ai_analysis_updated_at` ASC) USING BTREE,
  CONSTRAINT `emotion_diary_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Emotion Diary Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of emotion_diary
-- ----------------------------
INSERT INTO `emotion_diary` VALUES (2, 2, '2025-11-08', 7, 'Happy', 'Completed an important project', 'Today I successfully completed an important project and felt a great sense of accomplishment. The team cooperation went smoothly, and everyone was very cooperative.', 4, 2, NULL, NULL, '2025-11-08 09:41:02', '2025-11-08 09:41:02');
INSERT INTO `emotion_diary` VALUES (3, 2, '2025-11-09', 6, 'Calm', 'Daily study', 'Today was a relatively ordinary day. I completed my study tasks as planned. Nothing special happened, and my mood was quite calm.', 4, 2, NULL, NULL, '2025-11-09 09:41:02', '2025-11-09 09:41:02');
INSERT INTO `emotion_diary` VALUES (4, 2, '2025-11-10', 8, 'Excited', 'Received good news', 'I received the good news I had been waiting for! I was in a particularly good mood and couldn\'t help but want to share it with friends around me.', 5, 1, NULL, NULL, '2025-11-10 09:41:02', '2025-11-10 09:41:02');
INSERT INTO `emotion_diary` VALUES (5, 2, '2025-11-11', 4, 'Anxious', 'Exam pressure', 'There is an important exam tomorrow, and I haven\'t reviewed enough. I feel very anxious and worried about not doing well.', 3, 4, '{\"primaryEmotion\":\"Anxious\",\"emotionScore\":40,\"isNegative\":true,\"riskLevel\":1,\"keywords\":[\"exam\",\"pressure\",\"anxiety\",\"review\"],\"suggestion\":\"Appropriate pressure can be turned into motivation\",\"icon\":\"😰\",\"label\":\"Anxious\",\"riskDescription\":\"Needs attention\",\"improvementSuggestions\":[\"deep breathing relaxation\",\"final key review\",\"ensure adequate sleep\"],\"timestamp\":1716192000000}', '2025-09-14 14:05:52', '2025-09-11 09:41:02', '2025-11-14 14:05:51');
INSERT INTO `emotion_diary` VALUES (6, 2, '2025-11-12', 6, 'Relaxed', 'Exam finished', 'The exam is finally over. Although I don\'t know the result, at least the pressure is released. I can rest well.', 4, 2, NULL, NULL, '2025-11-12 09:41:02', '2025-11-12 09:41:02');
INSERT INTO `emotion_diary` VALUES (7, 2, '2025-11-13', 5, 'Tired', 'Busy work', 'Today was particularly busy at work, constantly dealing with various matters. I feel physically and mentally exhausted and need to rest well.', 3, 3, NULL, NULL, '2025-11-13 09:41:02', '2025-11-13 09:41:02');
INSERT INTO `emotion_diary` VALUES (8, 2, '2025-11-14', 3, 'Anxious', 'Conflict with friend', 'Had a conflict with a friend, feeling very upset', 2, 4, '{\"primaryEmotion\":\"Anxious\",\"emotionScore\":75,\"isNegative\":true,\"riskLevel\":2,\"keywords\":[\"friend\",\"conflict\",\"anxiety\",\"pressure\",\"sleep\"],\"suggestion\":\"The conflict with your friend makes you anxious, try to calm down and communicate\",\"icon\":\"😰\",\"label\":\"Anxious\",\"riskDescription\":\"Needs psychological counseling\",\"improvementSuggestions\":[\"deep breathing to relax\",\"communicate honestly with friends\",\"improve sleep environment\",\"moderate exercise to relieve stress\"],\"timestamp\":1719216000000}', '2025-09-14 14:14:45', '2025-09-14 09:41:02', '2025-11-14 14:14:44');
INSERT INTO `emotion_diary` VALUES (14, 4, '2025-11-08', 5, 'Nervous', 'Adapting to new environment', 'Just arrived in a new environment, everything feels unfamiliar. Need time to adapt to the new pace of life.', 3, 3, NULL, NULL, '2025-11-08 09:41:02', '2025-11-08 09:41:02');
INSERT INTO `emotion_diary` VALUES (15, 4, '2025-11-09', 6, 'Curious', 'Exploring new things', 'Started exploring the surrounding environment, discovered many interesting places. Full of curiosity about the future.', 4, 2, NULL, NULL, '2025-11-09 09:41:02', '2025-11-09 09:41:02');
INSERT INTO `emotion_diary` VALUES (16, 4, '2025-11-10', 8, 'Excited', 'Making new friends', 'Met several interesting new friends today, everyone had a great conversation. Life is starting to become more colorful.', 5, 1, NULL, NULL, '2025-11-10 09:41:02', '2025-11-10 09:41:02');
INSERT INTO `emotion_diary` VALUES (17, 4, '2025-11-11', 4, 'Lonely', 'Missing hometown', 'Suddenly missing hometown and family very much, feeling a bit lonely. Although the new environment is good, still homesick.', 3, 3, NULL, NULL, '2025-11-11 09:41:02', '2025-11-11 09:41:02');
INSERT INTO `emotion_diary` VALUES (18, 4, '2025-11-12', 7, 'Fulfilled', 'Busy day', 'Had a very fulfilling day today, completed many things. Feel that I am slowly adapting to the new life.', 4, 2, NULL, NULL, '2025-11-12 09:41:02', '2025-11-12 09:41:02');
INSERT INTO `emotion_diary` VALUES (19, 4, '2025-11-13', 3, 'Frustrated', 'Encountered difficulties', 'Encountered some difficulties, feeling a bit frustrated. But I believe through effort I can definitely overcome them.', 2, 4, NULL, NULL, '2025-11-13 09:41:02', '2025-11-13 09:41:02');
INSERT INTO `emotion_diary` VALUES (20, 4, '2025-11-14', 6, 'Determined', 'Making plans', 'Made detailed plans for myself, feel that goals are clearer. Having direction brings motivation.', 4, 2, NULL, NULL, '2025-11-14 09:41:02', '2025-11-14 09:41:02');
INSERT INTO `emotion_diary` VALUES (26, 8, '2025-12-20', 1, 'Sad', 'Feeling down', 'Having a really tough day today, feeling emotionally drained and overwhelmed.', 1, 4, NULL, NULL, '2025-12-20 09:41:02', '2025-12-20 09:41:02');
INSERT INTO `emotion_diary` VALUES (34, 8, '2025-12-17', 6, 'Focused', 'Study session', 'Had a productive study session at the library. Made good progress on my research paper and feeling accomplished.', 4, 2, NULL, NULL, '2025-12-17 11:00:00', '2025-12-21 22:22:20');
INSERT INTO `emotion_diary` VALUES (35, 8, '2025-12-18', 7, 'Social', 'Coffee with friends', 'Met up with classmates for coffee. Great conversations about our plans for the upcoming holidays. Feeling connected.', 4, 2, NULL, NULL, '2025-12-18 15:30:00', '2025-12-21 22:22:20');
INSERT INTO `emotion_diary` VALUES (36, 8, '2025-12-19', 5, 'Reflective', 'Journaling', 'Spent time writing in my journal about the past semester. So much growth and change. Feeling thoughtful about my journey.', 3, 3, NULL, NULL, '2025-12-19 21:00:00', '2025-12-21 22:22:20');
INSERT INTO `emotion_diary` VALUES (38, 8, '2025-12-21', 3, 'Stressed', 'Exam preparation', 'Final exams are approaching and feeling the pressure. So much to study and not enough time. Need to manage stress better.', 2, 4, NULL, NULL, '2025-12-21 22:15:00', '2025-12-21 22:22:20');
INSERT INTO `emotion_diary` VALUES (39, 8, '2025-12-22', 6, 'Hopeful', 'Holiday anticipation', 'Getting excited about the upcoming holidays. Looking forward to spending time with family and recharging my batteries.', 4, 2, NULL, NULL, '2025-12-22 17:30:00', '2025-12-21 22:22:20');

-- ----------------------------
-- Table structure for knowledge_article
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_article`;
CREATE TABLE `knowledge_article`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Article ID (UUID)',
  `category_id` bigint NOT NULL COMMENT 'Category ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Article title',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Article summary',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Article content',
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Cover image',
  `tags` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Tags',
  `author_id` bigint NULL DEFAULT NULL COMMENT 'Author ID',
  `read_count` int NULL DEFAULT 0 COMMENT 'Read count',
  `status` tinyint NULL DEFAULT 1 COMMENT 'Status 1:Published',
  `published_at` datetime NULL DEFAULT NULL COMMENT 'Publish time',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `author_id`(`author_id` ASC) USING BTREE,
  INDEX `idx_category_article`(`category_id` ASC, `published_at` ASC) USING BTREE,
  INDEX `idx_title`(`title` ASC) USING BTREE,
  CONSTRAINT `knowledge_article_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `knowledge_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `knowledge_article_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Knowledge Article Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledge_article
-- ----------------------------
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440001', 1, 'How to Identify and Manage Anxiety', 'Anxiety is a common emotional response in modern life. Learning to identify and manage anxiety is crucial for mental health.', '<p>Anxiety is a normal emotional response, but excessive anxiety can affect our daily lives. This article will introduce how to identify anxiety symptoms and some effective management methods.</p><h3>Identifying Anxiety Symptoms</h3><ul><li>Rapid heartbeat, sweating</li><li>Shortness of breath</li><li>Racing thoughts</li><li>Difficulty concentrating</li></ul><h3>Anxiety Management Methods</h3><ol><li>Deep breathing exercises</li><li>Mindfulness meditation</li><li>Moderate exercise</li><li>Seeking professional help</li></ol>', '', 'anxiety,emotion management,mental health', 1, 15, 1, '2025-09-01 10:00:00', '2025-11-01 10:00:00', '2025-11-01 10:00:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440002', 2, 'Five Effective Strategies for Emotion Regulation', 'Master emotion regulation skills to make life more balanced and harmonious.', '<p>Emotion regulation is an important part of mental health. Here are five scientifically validated emotion regulation strategies:</p><h3>1. Cognitive Restructuring</h3><p>Learn to view problems from different perspectives and challenge negative thought patterns.</p><h3>2. Emotion Labeling</h3><p>Accurately identify and name your emotional states.</p><h3>3. Progressive Muscle Relaxation</h3><p>Relieve emotional tension through physical relaxation.</p><h3>4. Expressive Writing</h3><p>Process complex emotional experiences through writing.</p><h3>5. Social Support</h3><p>Seek understanding and support from friends and family.</p>', '', 'emotion regulation,psychological skills,self management', 1, 23, 1, '2025-11-02 14:30:00', '2025-11-02 14:30:00', '2025-11-02 14:30:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440003', 3, 'Workplace Stress Management Guide', 'In a fast-paced work environment, learning to effectively manage stress is key to career success.', '<p>Workplace stress is an unavoidable challenge in modern work life. This guide will help you establish an effective stress management system.</p><h3>Identify Stress Sources</h3><ul><li>Excessive workload</li><li>Tense interpersonal relationships</li><li>Career development anxiety</li><li>Work-life balance difficulties</li></ul><h3>Stress Management Strategies</h3><ol><li>Time management skills</li><li>Set reasonable goals</li><li>Build support networks</li><li>Cultivate hobbies and interests</li><li>Regular rest and relaxation</li></ol><h3>Long-term Stress Prevention</h3><p>Establish healthy work habits and lifestyle to prevent stress accumulation.</p>', '', 'workplace stress,time management,work-life balance', 1, 31, 1, '2025-11-03 09:15:00', '2025-09-03 09:15:00', '2025-11-03 09:15:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440004', 4, 'Building Healthy Interpersonal Relationships', 'Good interpersonal relationships are the cornerstone of mental health and life happiness.', '<p>The quality of interpersonal relationships directly affects our mental health and life satisfaction. This article explores how to establish and maintain healthy interpersonal relationships.</p><h3>Characteristics of Healthy Relationships</h3><ul><li>Mutual respect and trust</li><li>Effective communication</li><li>Emotional support</li><li>Clear personal boundaries</li></ul><h3>Communication Skills</h3><ol><li>Active listening</li><li>Express genuine feelings</li><li>Non-violent communication</li><li>Conflict resolution</li></ol><h3>Methods to Maintain Relationships</h3><p>Regular contact, express gratitude, grow together, handle disagreements.</p>', '', 'interpersonal relationships,communication skills,social abilities', 1, 18, 1, '2025-11-04 16:20:00', '2025-11-04 16:20:00', '2025-11-04 16:20:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440005', 1, 'Sleep Quality and Mental Health', 'Quality sleep is an important foundation for maintaining mental health.', '<p>Sleep quality is closely related to mental health. Adequate sleep not only restores physical functions but also has important effects on emotion regulation and cognitive function.</p><h3>Impact of Sleep on Mental Health</h3><ul><li>Emotional stability</li><li>Stress coping ability</li><li>Memory and learning ability</li><li>Attention concentration</li></ul><h3>Methods to Improve Sleep Quality</h3><ol><li>Establish regular sleep schedule</li><li>Create good sleep environment</li><li>Pre-sleep relaxation activities</li><li>Avoid stimulating substances</li><li>Moderate exercise</li></ol>', '', 'sleep health,mental health,lifestyle habits', 1, 27, 1, '2025-11-05 11:45:00', '2025-11-05 11:45:00', '2025-11-05 11:45:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440006', 2, 'Mindfulness Practice Beginner Guide', 'Mindfulness practice is an effective stress reduction and emotion regulation method recommended by modern psychology.', '<p>Mindfulness is a practice method focusing on present moment experience that can help us better manage emotions and stress.</p><h3>What is Mindfulness</h3><p>Mindfulness is the ability to consciously and non-judgmentally focus on the present moment.</p><h3>Benefits of Mindfulness</h3><ul><li>Reduce anxiety and depression</li><li>Improve concentration</li><li>Enhance emotion regulation</li><li>Increase self-awareness</li></ul><h3>Basic Mindfulness Practices</h3><ol><li>Breath observation</li><li>Body scan</li><li>Walking meditation</li><li>Daily mindfulness</li></ol><h3>Practice Suggestions</h3><p>Start with 5-10 minutes daily and gradually increase practice time.</p>', '', 'mindfulness,meditation,stress relief,concentration', 1, 42, 1, '2025-11-06 13:10:00', '2025-11-06 13:10:00', '2025-11-06 13:10:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440007', 3, 'Student Psychological Stress Coping Strategies', 'Help students identify and cope with various psychological pressures in academic life.', '<p>Student life involves multiple pressures from academics, relationships, and future planning. Mastering effective coping strategies is crucial for student mental health.</p><h3>Common Stress Sources</h3><ul><li>Academic performance pressure</li><li>Peer relationships</li><li>Family expectations</li><li>Future planning anxiety</li></ul><h3>Coping Strategies</h3><ol><li>Reasonable study time planning</li><li>Cultivate hobbies and interests</li><li>Build support networks</li><li>Learn relaxation techniques</li><li>Seek professional help</li></ol><h3>Preventive Measures</h3><p>Establish healthy study habits and lifestyle.</p>', '', 'student psychology,academic stress,adolescent psychology', 1, 35, 1, '2025-11-07 08:30:00', '2025-11-07 08:30:00', '2025-11-07 08:30:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440008', 1, 'Identification and Coping with Depressive Emotions', 'Understand the characteristics of depressive emotions and learn early identification and effective coping.', '<p>Depressive emotions are common psychological problems. Early identification and intervention are important for preventing depression development.</p><h3>Manifestations of Depressive Emotions</h3><ul><li>Persistent sadness</li><li>Loss of interest and pleasure</li><li>Fatigue and lack of energy</li><li>Sleep and appetite changes</li><li>Difficulty concentrating</li></ul><h3>Coping Methods</h3><ol><li>Regular sleep schedule</li><li>Moderate physical exercise</li><li>Social activity participation</li><li>Professional psychological counseling</li><li>Medication (if needed)</li></ol><h3>Seeking Help</h3><p>When symptoms persist for more than two weeks, seek professional help promptly.</p>', '/files/bussiness/article/1757687894684.jpeg', 'depression,emotional disorders,psychotherapy', 1, 29, 1, '2025-11-08 15:00:00', '2025-11-08 15:00:00', '2025-11-12 22:38:16');

-- ----------------------------
-- Table structure for knowledge_category
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_category`;
CREATE TABLE `knowledge_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Category ID',
  `parent_id` bigint NULL DEFAULT 0 COMMENT 'Parent category ID',
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Category name',
  `category_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Category code',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Category description',
  `sort_order` int NULL DEFAULT 0 COMMENT 'Sort order',
  `status` tinyint NULL DEFAULT 1 COMMENT 'Status 0:Disabled 1:Enabled',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `category_code`(`category_code` ASC) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Knowledge Article Category Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledge_category
-- ----------------------------
INSERT INTO `knowledge_category` VALUES (1, 0, 'Mental Health Basics', NULL, 'Basic mental health knowledge and concepts.', 30, 1, '2025-11-04 12:50:03', '2025-11-13 11:48:16');
INSERT INTO `knowledge_category` VALUES (2, 0, 'Emotion Management', NULL, 'Emotion recognition, regulation and management skills', 40, 1, '2025-11-04 12:50:03', '2025-11-13 11:48:16');
INSERT INTO `knowledge_category` VALUES (3, 0, 'Stress Relief', NULL, 'Stress source analysis and relief methods', 20, 1, '2025-11-04 12:50:03', '2025-11-13 11:48:16');
INSERT INTO `knowledge_category` VALUES (4, 0, 'Interpersonal Relationships', NULL, 'Interpersonal communication and relationship handling', 10, 1, '2025-11-04 12:50:03', '2025-11-13 11:48:16');

-- ----------------------------
-- Table structure for sys_file_info
-- ----------------------------
DROP TABLE IF EXISTS `sys_file_info`;
CREATE TABLE `sys_file_info`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'File ID, primary key auto increment',
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Original file name (user uploaded file name)',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'File access path (server storage path)',
  `file_size` bigint NOT NULL DEFAULT 0 COMMENT 'File size, unit: bytes',
  `file_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'File type (IMG/PDF/TXT/DOC/XLS etc.)',
  `business_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Business type (used to distinguish file purpose, e.g.: avatar/document/attachment)',
  `business_id` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Business object ID (associated business data primary key)',
  `business_field` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Business field name (corresponding to field name in business table)',
  `upload_user_id` bigint NULL DEFAULT NULL COMMENT 'Upload user ID (record who uploaded the file)',
  `is_temp` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is temporary file (0:No 1:Yes)',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Status (0:Deleted 1:Normal)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  `expire_time` datetime NULL DEFAULT NULL COMMENT 'Expiration time (only effective for temporary files)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_business`(`business_type` ASC, `business_id` ASC) USING BTREE,
  INDEX `idx_upload_user`(`upload_user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_temp_expire`(`is_temp` ASC, `expire_time` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 56 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'System File Information Table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_file_info
-- ----------------------------
INSERT INTO `sys_file_info` VALUES (46, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756963989972.png', 178205, 'IMG', 'ARTICLE', 'b51ecba7-db3c-4a30-84ab-3a19e1e8264b', 'cover', 1, 0, 1, '2025-11-04 13:33:10', NULL);
INSERT INTO `sys_file_info` VALUES (47, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756964062385.png', 178205, 'IMG', 'ARTICLE', 'null', 'cover', 1, 0, 1, '2025-09-04 13:34:22', NULL);
INSERT INTO `sys_file_info` VALUES (48, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756964101109.png', 178205, 'IMG', 'ARTICLE', 'e26ad80e-87b2-490f-87c3-2d5f981ba7bf', 'cover', 1, 0, 1, '2025-11-04 13:35:01', NULL);
INSERT INTO `sys_file_info` VALUES (49, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756964116665.png', 178205, 'IMG', 'ARTICLE', '8d79085d-4686-4af7-813d-4f97c936ff3e', 'cover', 1, 0, 1, '2025-11-04 13:35:17', NULL);
INSERT INTO `sys_file_info` VALUES (50, 'image323232s.jpg', '/files/temp/1757670438125.jpg', 7727, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 0, '2025-11-12 17:47:18', '2025-11-13 17:47:18');
INSERT INTO `sys_file_info` VALUES (51, 'Untitled.jpg', '/files/temp/1757670832161.jpg', 7393, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 0, '2025-11-12 17:53:52', '2025-11-13 17:53:52');
INSERT INTO `sys_file_info` VALUES (52, 'ima9897ges.jpg', '/files/temp/1757670856780.jpg', 4977, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 0, '2025-11-12 17:54:17', '2025-11-13 17:54:17');
INSERT INTO `sys_file_info` VALUES (53, 'image323232s.jpg', '/files/bussiness/user_avatar/1757687320361.jpg', 7727, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 1, '2025-11-12 22:28:40', NULL);
INSERT INTO `sys_file_info` VALUES (54, '0a157ddd8a7070c5240fb3ad23a5fc38.jpeg', '/files/bussiness/article/1757687894684.jpeg', 135321, 'IMG', 'ARTICLE', '550e8400-e29b-41d4-a716-446655440008', 'cover', 1, 0, 1, '2025-11-12 22:38:15', NULL);
INSERT INTO `sys_file_info` VALUES (55, 'Unti555tled.jpg', '/files/bussiness/user_avatar/1757816752928.jpg', 6389, 'IMG', 'USER_AVATAR', '2', 'avatar', 2, 0, 1, '2025-11-14 10:25:53', NULL);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'User ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Username',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Email',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Phone number',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Password',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Nickname',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Avatar URL',
  `gender` tinyint NULL DEFAULT NULL COMMENT 'Gender 0:Unknown 1:Male 2:Female',
  `birthday` date NULL DEFAULT NULL COMMENT 'Birthday',
  `user_type` tinyint NULL DEFAULT 1 COMMENT 'User type 1:Regular user 2:Administrator',
  `status` tinyint NULL DEFAULT 1 COMMENT 'Status 0:Disabled 1:Normal',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `phone`(`phone` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_user_type`(`user_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'User Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', 'admin@example.com', '13123456789', '$2a$10$qUjCfQLqf9qVt1w1LDoaj.f5TUzBYcXh3FNNA0BhoQ54Vv2cSUt7K', 'System Administrator', '/files/bussiness/user_avatar/1757687320361.jpg', 1, '2019-09-02', 2, 1, '2025-10-30 12:00:01', '2025-11-12 22:28:42');
INSERT INTO `user` VALUES (2, 'test', '15165@qq.com', '13132584165', '$2a$10$qUjCfQLqf9qVt1w1LDoaj.f5TUzBYcXh3FNNA0BhoQ54Vv2cSUt7K', 'tyest', '/files/bussiness/user_avatar/1757816752928.jpg', 1, '2002-08-01', 1, 1, '2025-10-30 17:22:24', '2025-11-14 10:25:54');
INSERT INTO `user` VALUES (4, 'ces', '111111111111@qq.com', '13123456654', '$2a$10$Sy22CXQJe5OAS.Xvmbb60ul9O4a5qi5FtnOjFC2v/Ruk2binJ7vEm', '1561', NULL, 1, '2025-09-10', 1, 0, '2025-10-30 18:53:07', '2025-11-12 14:12:35');
INSERT INTO `user` VALUES (8, 'user', 'user@gmail.com', '13199999999', '$2a$10$Sy22CXQJe5OAS.Xvmbb60ul9O4a5qi5FtnOjFC2v/Ruk2binJ7vEm', 'TestUser', NULL, 1, '2000-01-01', 1, 1, '2025-12-21 22:20:00', '2025-12-21 22:20:00');

-- ----------------------------
-- Table structure for user_favorite
-- ----------------------------
DROP TABLE IF EXISTS `user_favorite`;
CREATE TABLE `user_favorite`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Favorite ID',
  `user_id` bigint NOT NULL COMMENT 'User ID',
  `article_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Article ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Favorite time',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_article_unique`(`user_id` ASC, `article_id` ASC) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  CONSTRAINT `user_favorite_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_favorite_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `knowledge_article` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'User Favorite Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_favorite
-- ----------------------------
INSERT INTO `user_favorite` VALUES (7, 2, '550e8400-e29b-41d4-a716-446655440008', '2025-11-14 14:13:37');

SET FOREIGN_KEY_CHECKS = 1;