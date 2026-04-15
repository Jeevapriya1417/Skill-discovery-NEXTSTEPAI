# Project Analysis: NextStep AI

## 1. Project Overview

**Name:** NextStep AI  
**Version:** 1.0.0  
**Description:** AI-powered employability platform for tech college students and career switchers.  
**Purpose:** Help users discover suitable technical career domains, bridge skill gaps, and practice mock interviews with AI-powered feedback.  
**Target Users:**
- Tech college students seeking career direction
- Career switchers transitioning to tech roles

---

## 2. Architecture Overview

**Type:** Full-Stack Monolithic (Microservice-ready APIs)

### Layers
- **Presentation:** React 18 + Next.js 16 (App Router), TypeScript, Tailwind CSS
  - Components: Landing Page, Auth Pages, Dashboard, Skill Discovery, Gap Analysis, Mock Interview, Profile Management
- **Backend:** Next.js API Routes (RESTful, endpoint-based organization)
- **Database:** MongoDB + Mongoose (NoSQL, schema validation, connection pooling)
- **AI Services:**
  - Google Gemini AI (question generation, domain classification, assessment evaluation)
  - AssemblyAI (audio transcription, word-level timing, filler detection)

---

## 3. Data Models

- **User:** Authentication, profile, skills, career info; relationships to Assessment, InterviewSession, GapAnalysis, Recommendation, Roadmap, UserProgress
- **Assessment:** Stores test results, skill evaluations, strengths/weaknesses
- **GapAnalysis:** Analyzes skill gaps for career switchers/professionals
- **InterviewSession:** Tracks mock interviews (multi-section, audio, metrics)
- **Roadmap:** Personalized learning paths
- **Recommendation:** AI-generated domain suggestions
- **UserProgress:** Tracks improvement trends

---

## 4. Key Modules & Workflows

### 4.1 Skill Discovery (Students)
- Registration & Profile Setup → Proficiency Test Generation (Gemini) → Assessment Evaluation → Domain Recommendation → Roadmap Generation

### 4.2 Gap Analysis (Career Switchers)
- Role Selection → Skill Gap Analysis (Gemini) → Transition Roadmap → Results Dashboard

### 4.3 Mock Interview
- Session Creation → Question Generation (Gemini) → Audio Recording (AssemblyAI) → Transcription → Analysis → Feedback

### 4.4 User Management
- Auth (register, login, profile fetch/update)

---

## 5. API Endpoints (Highlights)

- `/api/auth/register` (POST): Register user
- `/api/auth/login` (POST): Login
- `/api/auth/profile` (GET): Fetch profile
- `/api/discovery/generate-test` (POST): Generate assessment
- `/api/discovery/evaluate` (POST): Evaluate answers
- `/api/discovery/domains` (GET): Get domain recommendations
- `/api/discovery/roadmap` (GET): Get learning roadmap
- `/api/gap/evaluate` (POST): Analyze skill gaps
- `/api/interview/start` (POST): Start interview session
- `/api/interview/upload-audio` (POST): Upload audio
- `/api/interview/transcribe` (POST): Transcribe audio
- `/api/interview/analyze` (POST): Analyze response
- `/api/interview/feedback` (POST): AI feedback

---

## 6. Integration Details

- **Google Gemini:**
  - Used for question generation, evaluation, domain matching, feedback, skill gap analysis
  - Multiple model fallback for reliability
- **AssemblyAI:**
  - Used for audio transcription, word-level timing, filler detection
- **Mongoose ODM:**
  - Schema validation, CRUD, connection pooling
- **NextAuth:**
  - Installed, but manual auth routes currently used

---

## 7. Data Flow (Sample)

### Skill Discovery
1. User registers (profile data)
2. `/api/discovery/generate-test` called with profile
3. Gemini generates questions
4. User takes assessment
5. Answers submitted to `/api/discovery/evaluate`
6. Gemini evaluates, returns strengths/weaknesses
7. Scores stored in MongoDB
8. `/api/discovery/domains` for recommendations
9. User selects domain → roadmap generated

### Mock Interview
1. User starts session
2. `/api/interview/start` generates questions
3. Audio recorded/uploaded
4. `/api/interview/transcribe` (AssemblyAI)
5. `/api/interview/analyze` for metrics
6. Feedback generated

---

## 8. Security & Best Practices
- Passwords hashed with bcryptjs
- API keys stored in `.env.local`
- Connection pooling for MongoDB
- Error handling and model fallback for AI APIs

---

## 9. Setup & Deployment
- Node.js 18+, npm, MongoDB required
- Install dependencies: `npm install`
- Configure `.env.local` with MongoDB, Gemini, AssemblyAI keys
- Run locally: `npm run dev`

---

## 10. Recommendations & Observations
- Consider migrating to NextAuth for unified session management
- Add more automated tests for API endpoints
- Monitor AI API quotas and fallback usage
- Expand dashboard analytics for user progress
- Document all API endpoints with example requests/responses

---

## 11. References
- See `PROJECT_ANALYSIS.json` for full technical breakdown
- See `SETUP.md` for local setup instructions
- See `mvp.md` for MVP requirements

---

*Generated on 2026-04-14 by GitHub Copilot (GPT-4.1)*
