# EmoSync - AI-Powered Mental Health Companion

<div align="center">
  <img src="https://img.shields.io/badge/Java-17-orange" alt="Java Version">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen" alt="Spring Boot Version">
  <img src="https://img.shields.io/badge/React-18.3.1-blue" alt="React Version">
  <img src="https://img.shields.io/badge/MySQL-8.0-blue" alt="MySQL Version">
  <img src="https://img.shields.io/badge/Redis-7.0-red" alt="Redis Version">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Project Status">
</div>

## 🌟 Overview

EmoSync is a comprehensive mental health management platform that combines AI-powered emotional analysis, diary tracking, and professional psychological consultation services. The platform provides users with personalized mental health support through emotion recognition, mood tracking, and intelligent counseling features.

## ✨ Key Features

### 🧠 AI-Powered Psychological Support

- **Real-time Chat Counseling**: AI-powered psychological consultation with streaming responses
- **Emotion Analysis**: Automatic emotion detection and analysis from diary entries and conversations
- **Personalized Recommendations**: Tailored mental health suggestions based on user patterns
- **Multi-Model AI Support**: Compatible with OpenAI, DeepSeek, and other AI providers

### 📔 Emotion Diary & Tracking

- **Daily Mood Tracking**: Record daily emotions, sleep quality, and stress levels
- **Visual Emotion Garden**: Interactive visualization of emotional patterns
- **Comprehensive Statistics**: Detailed emotion analysis with charts and insights
- **Trend Analysis**: Track emotional patterns over time with AI-generated insights

### 📚 Knowledge Base

- **Mental Health Articles**: Curated collection of mental health resources
- **Category Organization**: Well-structured content across various mental health topics
- **Search & Discovery**: Easy access to relevant mental health information
- **User Favorites**: Save and organize helpful articles

### 👥 User Management

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **User Profiles**: Comprehensive user information and preferences
- **Role-Based Access**: Differentiated access for users and administrators
- **Privacy Protection**: Secure data handling and privacy controls

### 🛠️ Administrative Features

- **Content Management**: Admin panel for knowledge base management
- **User Analytics**: Comprehensive user behavior and emotion analytics
- **AI Task Management**: Monitor and manage AI analysis tasks
- **System Monitoring**: Real-time system health and performance monitoring

## 🏗️ Architecture

### Backend (Spring Boot)

```
├── emosync-server/          # Main application module
├── emosync-pojo/           # Data transfer objects and entities
└── emosync-common/         # Common utilities and configurations
```

### Frontend (React)

```
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   │   ├── auth/          # Authentication pages
│   │   ├── user/          # User-facing pages
│   │   └── admin/         # Admin pages
│   └── store/             # Redux state management
```

## 🚀 Technology Stack

### Backend

- **Framework**: Spring Boot 3.2.3
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Security**: Spring Security + JWT
- **AI Integration**: Spring AI (OpenAI/DeepSeek compatible)
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Maven

### Frontend

- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: Headless UI + Tailwind CSS
- **Charts**: ECharts, Recharts
- **HTTP Client**: Axios
- **Streaming**: Server-Sent Events (SSE)

### Database Schema

- **Users**: User management and authentication
- **Emotion Diaries**: Daily emotion tracking and analytics
- **Consultation Sessions**: AI chat sessions and message history
- **Knowledge Base**: Mental health articles and categories
- **AI Analysis Tasks**: Asynchronous AI processing queue

## 📋 Prerequisites

- **Java Development Kit (JDK)** 17 or higher
- **Maven** 3.6+ or **Gradle** 7+
- **MySQL** 8.0+
- **Redis** 6.0+
- **Node.js** 16+ and **npm** 8+
- **OpenAI API Key** or **DeepSeek API Key** (for AI features)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EmoSync.git
cd EmoSync
```

### 2. Backend Setup

#### Database Configuration

```sql
CREATE DATABASE EmoSync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import the database schema:

```bash
mysql -u root -p EmoSync_db < emosync-server/src/main/resources/EmoSync_db.sql
```

#### Environment Configuration

Create `application-local.yml` in `emosync-server/src/main/resources/`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/EmoSync_db?useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&useSSL=false&serverTimezone=GMT%2b8
    username: your_mysql_username
    password: your_mysql_password

  data:
    redis:
      host: localhost
      port: 6379
      password: your_redis_password

spring:
  ai:
    openai:
      api-key: your_openai_api_key
      base-url: https://api.openai.com
      chat:
        options:
          model: gpt-3.5-turbo
          temperature: 0.7
          max-tokens: 2000
```

#### Run Backend

```bash
cd EmoSync-backend
mvn clean install
mvn spring-boot:run -pl emosync-server
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../EmoSync-frontend
npm install
```

#### Configure API Endpoint

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

#### Run Frontend

```bash
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Admin Credentials**:
  - Username: `admin`
  - Password: `123456`

## 📊 API Documentation

### Core Endpoints

#### Authentication

- `POST /user/register` - User registration
- `POST /user/login` - User login
- `POST /user/refresh-token` - Refresh JWT token

#### Emotion Diary

- `POST /emotion-diary` - Create diary entry
- `GET /emotion-diary/statistics` - Get emotion statistics
- `PUT /emotion-diary/{id}` - Update diary entry

#### AI Consultation

- `POST /consultation/session` - Start consultation session
- `GET /consultation/chat` - Stream AI responses (SSE)
- `POST /consultation/message/{sessionId}` - Send message

#### Knowledge Base

- `GET /knowledge/articles` - Get articles list
- `GET /knowledge/articles/{id}` - Get article details
- `POST /user/favorite` - Add to favorites

## 🧪 Testing

### Backend Tests

```bash
cd EmoSync-backend
mvn test
```

### Frontend Tests

```bash
cd EmoSync-frontend
npm run test
```

## 📈 Usage Examples

### Starting a Consultation Session

```javascript
const sessionResponse = await fetch('/consultation/session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sessionTitle: 'Stress Management Session',
    initialMessage: 'I\'ve been feeling stressed lately...'
  })
});
```

### Streaming AI Responses

```javascript
const eventSource = new EventSource(
  `/consultation/chat?sessionId=${sessionId}&message=Hello`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('AI Response:', data.content);
};
```

### Creating Diary Entry

```javascript
const diaryEntry = {
  diaryDate: '2025-01-01',
  moodScore: 7,
  dominantEmotion: 'Happy',
  emotionTriggers: 'Good news received',
  diaryContent: 'Today was a great day...',
  sleepQuality: 4,
  stressLevel: 2
};

await fetch('/emotion-diary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(diaryEntry)
});
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=EmoSync_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# AI Service
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com
OPENAI_MODEL=gpt-3.5-turbo

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=86400000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow Java and JavaScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure code passes all linting checks

## 🗺️ Roadmap

### Version 2.0 (Upcoming)

- [ ] Mobile app (React Native)
- [ ] Multi-language support


### Version 1.5 (In Progress)

- [ ] Voice-based consultation
- [ ] Enhanced security features
- [ ] Performance optimizations
- [ ] Additional AI models support

---

<div align="center">
  <p>Made with ❤️ for mental health awareness</p>
  <p>© 2025 EmoSync Team. All rights reserved.</p>
</div>
