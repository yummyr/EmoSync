/*

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Host           : localhost:3306
 Source Schema         : EmoSync_db

 Date: 14/09/2025 15:33:46
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
INSERT INTO `consultation_message` VALUES (98, 17, 1, 1, 'Hello, my name is Xiao Ming', NULL, NULL, '2025-09-14 14:11:53');
INSERT INTO `consultation_message` VALUES (99, 17, 2, 1, 'Hello Xiao Ming! 😊 Nice to meet you~ I am your mental health assistant, you can call me \"Warm Heart\" or \"Xiao Nuan\". How have you been lately? As a college student, do you have many things you want to share? 💬\n\nYou can talk to me about anything, whether it is academic pressure, interpersonal relationships, or some confusion and anxiety about the future... I am here listening carefully ✨', NULL, 'openai', '2025-09-14 14:11:58');
INSERT INTO `consultation_message` VALUES (100, 17, 1, 1, 'I got into graduate school, but I feel lost', NULL, NULL, '2025-09-14 14:12:09');
INSERT INTO `consultation_message` VALUES (101, 17, 2, 1, 'Congratulations on getting into graduate school, Xiao Ming! 🎉 This is really something to be proud of~ But hearing you say you feel lost, I completely understand that feeling😊\n\nGraduate school is indeed very different from undergraduate. Can you tell me more about where your confusion comes from? ✨ For example:\n1️⃣ Worried about too much academic pressure?\n2️⃣ Uncertain about research direction?\n3️⃣ Or confused about future career planning?\n\nYou know what? This kind of \"post-acceptance confusion\" is actually very common~ It\'s like standing at a new starting line, a normal reaction when there are too many possibilities in front of you🌟\n\nWould you like us to sort it out together? Take your time, I\'m listening💛', NULL, 'openai', '2025-09-14 14:12:19');
INSERT INTO `consultation_message` VALUES (102, 17, 1, 1, 'Can you give me some advice for graduate school?', NULL, NULL, '2025-09-14 14:12:29');
INSERT INTO `consultation_message` VALUES (103, 17, 2, 1, 'Of course, Xiao Ming! 🎓 As someone about to start graduate school, this advice might help you~ ✨\n\n🔍 **Academic Adaptation**:\n1️⃣ Contact your advisor proactively: You can send an email to your advisor before school starts to discuss research direction and study plans\n2️⃣ Develop literature management habits: Try Zotero/EndNote, build a literature database from day one\n3️⃣ Take academic notes weekly: Recording inspiration is much easier than recalling later\n\n💡 **Mindset Adjustment Tips**:\n- Allow yourself to be \"slow to warm up\" in the first semester⏳ Many people need 3-6 months to adapt to the rhythm\n- Break big goals into quarterly/monthly small goals, sense of achievement UP↑\n- Lab mates are your best comrades, share confusion and resources more\n\n👩💻 **Practical Small Tools**:\n✓ Pomodoro Technique APP (focus 25 minutes + 5 minutes rest)\n✓ Academic calendar to mark important nodes\n✓ Regularly backup research data! (blood and tears lesson warning)\n\nXiao Ming noticed you mentioned confusion before, and I want to tell you specifically: It\'s really normal to feel lost in graduate school~🤗 Suggestions:\n- Attend more lab group meetings after school starts in September\n- Audit 1-2 courses in related fields\n- Have coffee with senior students to chat about experience\n\nRemember, graduate school is a marathon not a sprint🏃, finding your own rhythm is the most important thing! Which aspect do you want to start preparing for first? 💭', NULL, 'openai', '2025-09-14 14:12:47');

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
INSERT INTO `consultation_session` VALUES (17, 2, 'Warm Assistant - 9/14/2025, 2:11:52 PM', '2025-09-14 14:11:53', '{\"icon\": \"🤔\", \"label\": \"Curiosity\", \"keywords\": [\"advice\", \"curiosity\", \"preparation\", \"planning\", \"consultation\"], \"riskLevel\": 0, \"timestamp\": 1719216000000, \"isNegative\": false, \"suggestion\": \"Glad to provide graduate school advice for you\", \"emotionScore\": 45, \"primaryEmotion\": \"Thinking\", \"riskDescription\": \"Emotionally stable\", \"improvementSuggestions\": [\"List specific problem items\", \"Consult senior student experience\", \"Plan research direction\", \"Create study plan\"]}', '2025-09-14 14:12:35');

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
  `ai_emotion_analysis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'AI emotion analysis result (JSON format)',
  `ai_analysis_updated_at` datetime NULL DEFAULT NULL COMMENT 'AI analysis update time',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_date_unique`(`user_id` ASC, `diary_date` ASC) USING BTREE,
  INDEX `idx_user_diary`(`user_id` ASC, `diary_date` ASC) USING BTREE,
  INDEX `idx_ai_analysis_time`(`ai_analysis_updated_at` ASC) USING BTREE,
  CONSTRAINT `emotion_diary_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Emotion Diary Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of emotion_diary
-- ----------------------------
INSERT INTO `emotion_diary` VALUES (2, 2, '2025-09-08', 7, 'Happy', 'Completed an important project', 'Today I successfully completed an important project and felt a great sense of accomplishment. The team cooperation went smoothly, and everyone was very cooperative.', 4, 2, NULL, NULL, '2025-09-08 09:41:02', '2025-09-08 09:41:02');
INSERT INTO `emotion_diary` VALUES (3, 2, '2025-09-09', 6, 'Calm', 'Daily study', 'Today was a relatively ordinary day. I completed my study tasks as planned. Nothing special happened, and my mood was quite calm.', 4, 2, NULL, NULL, '2025-09-09 09:41:02', '2025-09-09 09:41:02');
INSERT INTO `emotion_diary` VALUES (4, 2, '2025-09-10', 8, 'Excited', 'Received good news', 'I received the good news I had been waiting for! I was in a particularly good mood and couldn\'t help but want to share it with friends around me.', 5, 1, NULL, NULL, '2025-09-10 09:41:02', '2025-09-10 09:41:02');
INSERT INTO `emotion_diary` VALUES (5, 2, '2025-09-11', 4, 'Anxious', 'Exam pressure', 'There is an important exam tomorrow, and I haven\'t reviewed enough. I feel very anxious and worried about not doing well.', 3, 4, '{\"primaryEmotion\":\"Anxious\",\"emotionScore\":40,\"isNegative\":true,\"riskLevel\":1,\"keywords\":[\"exam\",\"pressure\",\"anxiety\",\"review\"],\"suggestion\":\"Appropriate pressure can be turned into motivation\",\"icon\":\"😰\",\"label\":\"Anxious\",\"riskDescription\":\"Needs attention\",\"improvementSuggestions\":[\"deep breathing relaxation\",\"final key review\",\"ensure adequate sleep\"],\"timestamp\":1716192000000}', '2025-09-14 14:05:52', '2025-09-11 09:41:02', '2025-09-14 14:05:51');
INSERT INTO `emotion_diary` VALUES (6, 2, '2025-09-12', 6, 'Relaxed', 'Exam finished', 'The exam is finally over. Although I don\'t know the result, at least the pressure is released. I can rest well.', 4, 2, NULL, NULL, '2025-09-12 09:41:02', '2025-09-12 09:41:02');
INSERT INTO `emotion_diary` VALUES (7, 2, '2025-09-13', 5, 'Tired', 'Busy work', 'Today was particularly busy at work, constantly dealing with various matters. I feel physically and mentally exhausted and need to rest well.', 3, 3, NULL, NULL, '2025-09-13 09:41:02', '2025-09-13 09:41:02');
INSERT INTO `emotion_diary` VALUES (8, 2, '2025-09-14', 3, '焦虑', '和朋友闹矛盾', '和朋友闹矛盾，很难过', 2, 4, '{\"primaryEmotion\":\"焦虑\",\"emotionScore\":75,\"isNegative\":true,\"riskLevel\":2,\"keywords\":[\"朋友\",\"矛盾\",\"焦虑\",\"压力\",\"睡眠\"],\"suggestion\":\"和朋友之间的矛盾让你焦虑，试着冷静下来沟通\",\"icon\":\"😰\",\"label\":\"焦虑\",\"riskDescription\":\"需要心理疏导\",\"improvementSuggestions\":[\"深呼吸放松心情\",\"和朋友坦诚沟通\",\"改善睡眠环境\",\"适当运动缓解压力\"],\"timestamp\":1719216000000}', '2025-09-14 14:14:45', '2025-09-14 09:41:02', '2025-09-14 14:14:44');
INSERT INTO `emotion_diary` VALUES (14, 4, '2025-09-08', 5, '紧张', '新环境适应', '刚到新环境，对一切都感到陌生。需要时间去适应新的生活节奏。', 3, 3, NULL, NULL, '2025-09-08 09:41:02', '2025-09-08 09:41:02');
INSERT INTO `emotion_diary` VALUES (15, 4, '2025-09-09', 6, '好奇', '探索新事物', '开始探索周围的环境，发现了很多有趣的地方。对未来充满好奇。', 4, 2, NULL, NULL, '2025-09-09 09:41:02', '2025-09-09 09:41:02');
INSERT INTO `emotion_diary` VALUES (16, 4, '2025-09-10', 8, '兴奋', '结识新朋友', '今天认识了几个很有趣的新朋友，大家聊得很投机。感觉生活开始变得丰富多彩。', 5, 1, NULL, NULL, '2025-09-10 09:41:02', '2025-09-10 09:41:02');
INSERT INTO `emotion_diary` VALUES (17, 4, '2025-09-11', 4, '孤独', '思念家乡', '突然很想念家乡和家人，感到有些孤独。虽然新环境很好，但还是会想家。', 3, 3, NULL, NULL, '2025-09-11 09:41:02', '2025-09-11 09:41:02');
INSERT INTO `emotion_diary` VALUES (18, 4, '2025-09-12', 7, '充实', '忙碌的一天', '今天过得很充实，完成了很多事情。感觉自己在慢慢适应新的生活。', 4, 2, NULL, NULL, '2025-09-12 09:41:02', '2025-09-12 09:41:02');
INSERT INTO `emotion_diary` VALUES (19, 4, '2025-09-13', 3, '挫折', '遇到困难', '遇到了一些困难，感到有些挫败。但我相信通过努力一定能够克服。', 2, 4, NULL, NULL, '2025-09-13 09:41:02', '2025-09-13 09:41:02');
INSERT INTO `emotion_diary` VALUES (20, 4, '2025-09-14', 6, '坚定', '制定计划', '为自己制定了详细的计划，感觉目标更加清晰了。有了方向就有了动力。', 4, 2, NULL, NULL, '2025-09-14 09:41:02', '2025-09-14 09:41:02');

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
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440001', 1, '如何识别和管理焦虑情绪', '焦虑是现代生活中常见的情绪反应，学会识别和管理焦虑对心理健康至关重要。', '<p>焦虑是一种正常的情绪反应，但过度的焦虑可能会影响我们的日常生活。本文将介绍如何识别焦虑的症状，以及一些有效的管理方法。</p><h3>识别焦虑的症状</h3><ul><li>心跳加速、出汗</li><li>呼吸急促</li><li>思维混乱</li><li>难以集中注意力</li></ul><h3>管理焦虑的方法</h3><ol><li>深呼吸练习</li><li>正念冥想</li><li>适度运动</li><li>寻求专业帮助</li></ol>', '', '焦虑,情绪管理,心理健康', 1, 15, 1, '2025-09-01 10:00:00', '2025-09-01 10:00:00', '2025-09-01 10:00:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440002', 2, '情绪调节的五个有效策略', '掌握情绪调节技巧，让生活更加平衡和谐。', '<p>情绪调节是心理健康的重要组成部分。以下是五个经过科学验证的情绪调节策略：</p><h3>1. 认知重构</h3><p>学会从不同角度看待问题，挑战负面思维模式。</p><h3>2. 情绪标记</h3><p>准确识别和命名自己的情绪状态。</p><h3>3. 渐进式肌肉放松</h3><p>通过身体放松来缓解情绪紧张。</p><h3>4. 表达性写作</h3><p>通过写作来处理复杂的情绪体验。</p><h3>5. 社交支持</h3><p>寻求朋友和家人的理解与支持。</p>', '', '情绪调节,心理技巧,自我管理', 1, 23, 1, '2025-09-02 14:30:00', '2025-09-02 14:30:00', '2025-09-02 14:30:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440003', 3, '职场压力管理指南', '在快节奏的工作环境中，学会有效管理压力是职业成功的关键。', '<p>职场压力是现代工作生活中不可避免的挑战。本指南将帮助您建立有效的压力管理体系。</p><h3>识别压力源</h3><ul><li>工作量过大</li><li>人际关系紧张</li><li>职业发展焦虑</li><li>工作与生活平衡困难</li></ul><h3>压力管理策略</h3><ol><li>时间管理技巧</li><li>设定合理目标</li><li>建立支持网络</li><li>培养兴趣爱好</li><li>定期休息和放松</li></ol><h3>长期压力预防</h3><p>建立健康的工作习惯和生活方式，预防压力累积。</p>', '', '职场压力,时间管理,工作生活平衡', 1, 31, 1, '2025-09-03 09:15:00', '2025-09-03 09:15:00', '2025-09-03 09:15:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440004', 4, '建立健康的人际关系', '良好的人际关系是心理健康和生活幸福的基石。', '<p>人际关系质量直接影响我们的心理健康和生活满意度。本文将探讨如何建立和维护健康的人际关系。</p><h3>健康关系的特征</h3><ul><li>相互尊重和信任</li><li>有效沟通</li><li>情感支持</li><li>个人边界清晰</li></ul><h3>沟通技巧</h3><ol><li>积极倾听</li><li>表达真实感受</li><li>非暴力沟通</li><li>冲突解决</li></ol><h3>维护关系的方法</h3><p>定期联系、表达感激、共同成长、处理分歧。</p>', '', '人际关系,沟通技巧,社交能力', 1, 18, 1, '2025-09-04 16:20:00', '2025-09-04 16:20:00', '2025-09-04 16:20:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440005', 1, '睡眠质量与心理健康', '优质睡眠是维护心理健康的重要基础。', '<p>睡眠质量与心理健康密切相关。充足的睡眠不仅能恢复身体机能，还对情绪调节和认知功能有重要影响。</p><h3>睡眠对心理健康的影响</h3><ul><li>情绪稳定性</li><li>压力应对能力</li><li>记忆和学习能力</li><li>注意力集中</li></ul><h3>改善睡眠质量的方法</h3><ol><li>建立规律作息</li><li>创造良好睡眠环境</li><li>睡前放松活动</li><li>避免刺激性物质</li><li>适度运动</li></ol>', '', '睡眠健康,心理健康,生活习惯', 1, 27, 1, '2025-09-05 11:45:00', '2025-09-05 11:45:00', '2025-09-05 11:45:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440006', 2, '正念练习入门指南', '正念练习是现代心理学推荐的有效减压和情绪调节方法。', '<p>正念是一种专注于当下体验的练习方法，能够帮助我们更好地管理情绪和压力。</p><h3>什么是正念</h3><p>正念是有意识地、不带评判地关注当下时刻的能力。</p><h3>正念的益处</h3><ul><li>减少焦虑和抑郁</li><li>提高专注力</li><li>改善情绪调节</li><li>增强自我觉察</li></ul><h3>基础正念练习</h3><ol><li>呼吸观察</li><li>身体扫描</li><li>行走冥想</li><li>日常正念</li></ol><h3>练习建议</h3><p>从每天5-10分钟开始，逐渐增加练习时间。</p>', '', '正念,冥想,减压,专注力', 1, 42, 1, '2025-09-06 13:10:00', '2025-09-06 13:10:00', '2025-09-06 13:10:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440007', 3, '学生心理压力应对策略', '帮助学生识别和应对学习生活中的各种心理压力。', '<p>学生时期面临着学业、人际、未来规划等多重压力。掌握有效的应对策略对学生心理健康至关重要。</p><h3>常见压力源</h3><ul><li>学业成绩压力</li><li>同伴关系</li><li>家庭期望</li><li>未来规划焦虑</li></ul><h3>应对策略</h3><ol><li>合理规划学习时间</li><li>培养兴趣爱好</li><li>建立支持网络</li><li>学会放松技巧</li><li>寻求专业帮助</li></ol><h3>预防措施</h3><p>建立健康的学习习惯和生活方式。</p>', '', '学生心理,学业压力,青少年心理', 1, 35, 1, '2025-09-07 08:30:00', '2025-09-07 08:30:00', '2025-09-07 08:30:00');
INSERT INTO `knowledge_article` VALUES ('550e8400-e29b-41d4-a716-446655440008', 1, '抑郁情绪的识别与应对', '了解抑郁情绪的特征，学会早期识别和有效应对。', '<p>抑郁情绪是常见的心理困扰，及早识别和干预对预防抑郁症发展具有重要意义。</p><h3>抑郁情绪的表现</h3><ul><li>持续的悲伤情绪</li><li>兴趣和愉悦感丧失</li><li>疲劳和精力不足</li><li>睡眠和食欲改变</li><li>注意力难以集中</li></ul><h3>应对方法</h3><ol><li>规律的作息时间</li><li>适度的体育锻炼</li><li>社交活动参与</li><li>专业心理咨询</li><li>药物治疗（如需要）</li></ol><h3>寻求帮助</h3><p>当症状持续超过两周时，应及时寻求专业帮助。</p>', '/files/bussiness/article/1757687894684.jpeg', '抑郁,情绪障碍,心理治疗', 1, 29, 1, '2025-09-08 15:00:00', '2025-09-08 15:00:00', '2025-09-12 22:38:16');

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
INSERT INTO `knowledge_category` VALUES (1, 0, 'Mental Health Basics', NULL, 'Basic mental health knowledge and concepts.', 30, 1, '2025-09-04 12:50:03', '2025-09-13 11:48:16');
INSERT INTO `knowledge_category` VALUES (2, 0, 'Emotion Management', NULL, 'Emotion recognition, regulation and management skills', 40, 1, '2025-09-04 12:50:03', '2025-09-13 11:48:16');
INSERT INTO `knowledge_category` VALUES (3, 0, 'Stress Relief', NULL, 'Stress source analysis and relief methods', 20, 1, '2025-09-04 12:50:03', '2025-09-13 11:48:16');
INSERT INTO `knowledge_category` VALUES (4, 0, 'Interpersonal Relationships', NULL, 'Interpersonal communication and relationship handling', 10, 1, '2025-09-04 12:50:03', '2025-09-13 11:48:16');

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
INSERT INTO `sys_file_info` VALUES (46, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756963989972.png', 178205, 'IMG', 'ARTICLE', 'b51ecba7-db3c-4a30-84ab-3a19e1e8264b', 'cover', 1, 0, 1, '2025-09-04 13:33:10', NULL);
INSERT INTO `sys_file_info` VALUES (47, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756964062385.png', 178205, 'IMG', 'ARTICLE', 'null', 'cover', 1, 0, 1, '2025-09-04 13:34:22', NULL);
INSERT INTO `sys_file_info` VALUES (48, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756964101109.png', 178205, 'IMG', 'ARTICLE', 'e26ad80e-87b2-490f-87c3-2d5f981ba7bf', 'cover', 1, 0, 1, '2025-09-04 13:35:01', NULL);
INSERT INTO `sys_file_info` VALUES (49, '7487e74da9ec1ee07b5064348942b2ca.png', '/files/bussiness/article/1756964116665.png', 178205, 'IMG', 'ARTICLE', '8d79085d-4686-4af7-813d-4f97c936ff3e', 'cover', 1, 0, 1, '2025-09-04 13:35:17', NULL);
INSERT INTO `sys_file_info` VALUES (50, 'image323232s.jpg', '/files/temp/1757670438125.jpg', 7727, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 0, '2025-09-12 17:47:18', '2025-09-13 17:47:18');
INSERT INTO `sys_file_info` VALUES (51, 'Untitled.jpg', '/files/temp/1757670832161.jpg', 7393, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 0, '2025-09-12 17:53:52', '2025-09-13 17:53:52');
INSERT INTO `sys_file_info` VALUES (52, 'ima9897ges.jpg', '/files/temp/1757670856780.jpg', 4977, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 0, '2025-09-12 17:54:17', '2025-09-13 17:54:17');
INSERT INTO `sys_file_info` VALUES (53, 'image323232s.jpg', '/files/bussiness/user_avatar/1757687320361.jpg', 7727, 'IMG', 'USER_AVATAR', '1', 'avatar', 1, 0, 1, '2025-09-12 22:28:40', NULL);
INSERT INTO `sys_file_info` VALUES (54, '0a157ddd8a7070c5240fb3ad23a5fc38.jpeg', '/files/bussiness/article/1757687894684.jpeg', 135321, 'IMG', 'ARTICLE', '550e8400-e29b-41d4-a716-446655440008', 'cover', 1, 0, 1, '2025-09-12 22:38:15', NULL);
INSERT INTO `sys_file_info` VALUES (55, 'Unti555tled.jpg', '/files/bussiness/user_avatar/1757816752928.jpg', 6389, 'IMG', 'USER_AVATAR', '2', 'avatar', 2, 0, 1, '2025-09-14 10:25:53', NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'User Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', 'admin@example.com', '13123456789', '$2a$10$qUjCfQLqf9qVt1w1LDoaj.f5TUzBYcXh3FNNA0BhoQ54Vv2cSUt7K', 'System Administrator', '/files/bussiness/user_avatar/1757687320361.jpg', 1, '2019-09-02', 2, 1, '2025-08-30 12:00:01', '2025-09-12 22:28:42');
INSERT INTO `user` VALUES (2, 'test', '15165@qq.com', '13132584165', '$2a$10$qUjCfQLqf9qVt1w1LDoaj.f5TUzBYcXh3FNNA0BhoQ54Vv2cSUt7K', 'tyest', '/files/bussiness/user_avatar/1757816752928.jpg', 1, '2002-08-01', 1, 1, '2025-08-30 17:22:24', '2025-09-14 10:25:54');
INSERT INTO `user` VALUES (4, 'ces', '111111111111@qq.com', '13123456654', '$2a$10$Sy22CXQJe5OAS.Xvmbb60ul9O4a5qi5FtnOjFC2v/Ruk2binJ7vEm', '1561', NULL, 1, '2025-09-10', 1, 0, '2025-08-30 18:53:07', '2025-09-12 14:12:35');

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
INSERT INTO `user_favorite` VALUES (7, 2, '550e8400-e29b-41d4-a716-446655440008', '2025-09-14 14:13:37');

SET FOREIGN_KEY_CHECKS = 1;
