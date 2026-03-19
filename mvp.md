# **PROJECT NEEDS :**

## **MVP:**

**{**

  **"project": "NextStep AI",**

  **"description": "AI-powered employability platform for tech college students and career switchers",**

  **"tech\_stack": {**

    **"frontend": "Next.js",**

    **"backend": "Next.js API Routes",**

    **"database": "MongoDB",**

    **"ai\_engine": "Google Gemini",**

    **"speech\_engine": "AssemblyAI"**

  **},**

  **"users": {**

    **"type\_1": {**

      **"label": "Tech College Student",**

      **"goal": "Discover the right technical domain and get a learning roadmap",**

      **"entry\_point": "Skill Discovery"**

    **},**

    **"type\_2": {**

      **"label": "Career Switcher",**

      **"goal": "Transition from current role to a new technical domain",**

      **"entry\_point": "Gap Analysis"**

    **}**

  **},**

  **"modules": {**

    **"module\_1": {**

      **"name": "Skill Discovery",**

      **"target\_user": "Tech College Student",**

      **"flow": \[**

        **{**

          **"step": 1,**

          **"action": "User Registration and Profile Setup",**

          **"details": {**

            **"inputs": \[**

              **"Name",**

              **"Email",**

              **"College Name",**

              **"Year of Study",**

              **"Programming Languages Known",**

              **"Self-Rated Skill Level (Beginner / Intermediate / Advanced)"**

            **],**

            **"stored\_in": "MongoDB users collection"**

          **}**

        **},**

        **{**

          **"step": 2,**

          **"action": "Proficiency Test Generation",**

          **"details": {**

            **"trigger": "User submits known programming languages",**

            **"process": "Google Gemini generates a set of MCQ and short-answer questions based on the languages selected and the self-rated level",**

            **"question\_count": "10-15 per language",**

            **"difficulty": "Adaptive based on self-rated level",**

            **"output": "Question set rendered on frontend"**

          **}**

        **},**

        **{**

          **"step": 3,**

          **"action": "Proficiency Evaluation",**

          **"details": {**

            **"trigger": "User completes the test",**

            **"process": "Answers sent to Gemini for evaluation and scoring",**

            **"output": {**

              **"score\_per\_language": "Percentage score",**

              **"evaluated\_level": "Beginner / Intermediate / Advanced",**

              **"strengths": "Topics where user performed well",**

              **"weaknesses": "Topics where user needs improvement"**

            **},**

            **"stored\_in": "MongoDB assessments collection"**

          **}**

        **},**

        **{**

          **"step": 4,**

          **"action": "Domain Suggestion",**

          **"details": {**

            **"trigger": "Proficiency evaluation complete",**

            **"process": "Gemini analyzes evaluated skills and suggests suitable technical domains",**

            **"output": {**

              **"suggested\_domains": \[**

                **{**

                  **"domain": "e.g. Data Science",**

                  **"match\_reason": "Strong in Python and statistics fundamentals"**

                **},**

                **{**

                  **"domain": "e.g. Backend Development",**

                  **"match\_reason": "Good grasp of Java and database concepts"**

                **},**

                **{**

                  **"domain": "e.g. Frontend Development",**

                  **"match\_reason": "Proficient in JavaScript and UI logic"**

                **}**

              **]**

            **},**

            **"stored\_in": "MongoDB recommendations collection"**

          **}**

        **},**

        **{**

          **"step": 5,**

          **"action": "Domain Selection by User",**

          **"details": {**

            **"trigger": "User views suggested domains",**

            **"process": "User selects one domain they want to pursue",**

            **"output": "Selected domain stored in user profile"**

          **}**

        **},**

        **{**

          **"step": 6,**

          **"action": "Personalized Roadmap Generation",**

          **"details": {**

            **"trigger": "User selects a domain",**

            **"process": "Gemini generates a step-by-step learning roadmap based on what the user already knows and what they still need to learn for the selected domain",**

            **"output": {**

              **"roadmap": {**

                **"already\_covered": \["Topics user already knows"],**

                **"to\_learn": \[**

                  **{**

                    **"stage": 1,**

                    **"topic": "e.g. Pandas and NumPy",**

                    **"estimated\_duration": "2 weeks"**

                  **},**

                  **{**

                    **"stage": 2,**

                    **"topic": "e.g. Machine Learning Basics",**

                    **"estimated\_duration": "4 weeks"**

                  **}**

                **],**

                **"total\_estimated\_time": "e.g. 3 months"**

              **}**

            **},**

            **"stored\_in": "MongoDB roadmaps collection"**

          **}**

        **}**

      **]**

    **},**

    **"module\_2": {**

      **"name": "Gap Analysis",**

      **"target\_user": "Career Switcher",**

      **"flow": \[**

        **{**

          **"step": 1,**

          **"action": "User Registration and Career Profile Setup",**

          **"details": {**

            **"inputs": \[**

              **"Name",**

              **"Email",**

              **"Current Role (e.g. Full Stack Developer)",**

              **"Years of Experience",**

              **"Technologies Currently Working With",**

              **"Target Role (e.g. Data Scientist)"**

            **],**

            **"stored\_in": "MongoDB users collection"**

          **}**

        **},**

        **{**

          **"step": 2,**

          **"action": "Current Skill Proficiency Test",**

          **"details": {**

            **"trigger": "User submits current and target role information",**

            **"process": "Gemini generates proficiency test questions covering both current skills and foundational topics of the target role",**

            **"question\_count": "15-20 questions",**

            **"output": "Question set rendered on frontend"**

          **}**

        **},**

        **{**

          **"step": 3,**

          **"action": "Gap Identification",**

          **"details": {**

            **"trigger": "User completes the proficiency test",**

            **"process": "Gemini compares evaluated current skills against the requirements of the target role",**

            **"output": {**

              **"transferable\_skills": \["Skills from current role that apply to target role"],**

              **"skill\_gaps": \["Specific topics and technologies the user lacks"],**

              **"gap\_severity": "Low / Medium / High per topic"**

            **},**

            **"stored\_in": "MongoDB gap\_analysis collection"**

          **}**

        **},**

        **{**

          **"step": 4,**

          **"action": "Focused Transition Roadmap Generation",**

          **"details": {**

            **"trigger": "Gap identification complete",**

            **"process": "Gemini builds a curriculum covering only the missing skills, skipping what the user already knows",**

            **"output": {**

              **"transition\_roadmap": {**

                **"skip": \["Topics user already masters"],**

                **"focus\_areas": \[**

                  **{**

                    **"stage": 1,**

                    **"topic": "e.g. Statistics for Data Science",**

                    **"estimated\_duration": "2 weeks"**

                  **},**

                  **{**

                    **"stage": 2,**

                    **"topic": "e.g. Python for ML",**

                    **"estimated\_duration": "3 weeks"**

                  **}**

                **],**

                **"total\_estimated\_time": "e.g. 2 months"**

              **}**

            **},**

            **"stored\_in": "MongoDB roadmaps collection"**

          **}**

        **}**

      **]**

    **},**

    **"module\_3": {**

      **"name": "Mock Interview Platform",**

      **"target\_user": "Both Tech College Students and Career Switchers",**

      **"flow": \[**

        **{**

          **"step": 1,**

          **"action": "Interview Session Setup",**

          **"details": {**

            **"trigger": "User navigates to mock interview section",**

            **"process": "System fetches user's selected domain from their profile and Gemini generates domain-specific interview questions focused on communication round style",**

            **"output": {**

              **"questions": \[**

                **"e.g. Explain how you would approach building a recommendation system",**

                **"e.g. Walk me through your understanding of RESTful architecture"**

              **],**

              **"question\_type": "Open-ended verbal response",**

              **"total\_questions": "5-8 per session"**

            **}**

          **}**

        **},**

        **{**

          **"step": 2,**

          **"action": "Audio Recording",**

          **"details": {**

            **"trigger": "User begins answering a question",**

            **"process": "Frontend captures audio through browser microphone API",**

            **"output": "Audio file per question stored temporarily"**

          **}**

        **},**

        **{**

          **"step": 3,**

          **"action": "Speech to Text Transcription",**

          **"details": {**

            **"trigger": "User submits recorded answer",**

            **"process": "Audio file sent to AssemblyAI for transcription",**

            **"output": {**

              **"transcript": "Full text of spoken response",**

              **"word\_timestamps": "Timestamp for each word",**

              **"confidence\_score": "Transcription accuracy confidence"**

            **}**

          **}**

        **},**

        **{**

          **"step": 4,**

          **"action": "Vocal Analysis",**

          **"details": {**

            **"trigger": "Transcription received from AssemblyAI",**

            **"process": "System parses transcript to extract vocal performance metrics",**

            **"output": {**

              **"filler\_word\_count": {**

                **"um": 0,**

                **"uh": 0,**

                **"ah": 0,**

                **"like": 0,**

                **"you\_know": 0,**

                **"total": 0**

              **},**

              **"speaking\_pace": {**

                **"words\_per\_minute": 0,**

                **"evaluation": "Too Slow / Optimal / Too Fast"**

              **},**

              **"pause\_analysis": {**

                **"long\_pauses\_count": 0,**

                **"average\_pause\_duration\_seconds": 0**

              **},**

              **"response\_duration\_seconds": 0**

            **}**

          **}**

        **},**

        **{**

          **"step": 5,**

          **"action": "Content Evaluation",**

          **"details": {**

            **"trigger": "Transcript available",**

            **"process": "Transcript sent to Gemini along with the original question for content relevance and quality evaluation",**

            **"output": {**

              **"relevance\_score": "How well the answer addresses the question",**

              **"clarity\_score": "How clearly the idea was communicated",**

              **"depth\_score": "How thoroughly the topic was covered",**

              **"content\_feedback": "Specific suggestions on what to include or improve"**

            **}**

          **}**

        **},**

        **{**

          **"step": 6,**

          **"action": "Feedback Report Generation",**

          **"details": {**

            **"trigger": "Both vocal analysis and content evaluation complete",**

            **"process": "System compiles a unified feedback report combining vocal metrics and content quality",**

            **"output": {**

              **"overall\_confidence\_score": "Percentage based on vocal and content metrics",**

              **"vocal\_feedback": "Specific areas to improve in speech delivery",**

              **"content\_feedback": "Specific areas to improve in answer substance",**

              **"improvement\_tips": \[**

                **"e.g. Reduce filler words by pausing briefly instead of saying um",**

                **"e.g. Slow down your pace from 180 wpm to around 140 wpm",**

                **"e.g. Include a real-world example when explaining concepts"**

              **]**

            **},**

            **"stored\_in": "MongoDB interview\_sessions collection"**

          **}**

        **},**

        **{**

          **"step": 7,**

          **"action": "Progress Tracking",**

          **"details": {**

            **"trigger": "Multiple sessions completed",**

            **"process": "System compares metrics across sessions to show improvement over time",**

            **"output": {**

              **"filler\_word\_trend": "Decreasing / Stable / Increasing",**

              **"pace\_trend": "Improving / Stable / Needs Work",**

              **"confidence\_trend": "Growth percentage across sessions"**

            **},**

            **"stored\_in": "MongoDB user\_progress collection"**

          **}**

        **}**

      **]**

    **}**

  **},**

  **"database\_schema": {**

    **"collections": {**

      **"users": {**

        **"fields": \["user\_id", "name", "email", "user\_type", "college\_name", "year\_of\_study", "current\_role", "target\_role", "languages\_known", "selected\_domain", "created\_at"]**

      **},**

      **"assessments": {**

        **"fields": \["assessment\_id", "user\_id", "questions", "answers", "scores", "evaluated\_level", "strengths", "weaknesses", "created\_at"]**

      **},**

      **"recommendations": {**

        **"fields": \["recommendation\_id", "user\_id", "suggested\_domains", "match\_reasons", "created\_at"]**

      **},**

      **"roadmaps": {**

        **"fields": \["roadmap\_id", "user\_id", "type", "domain", "already\_covered", "to\_learn", "total\_estimated\_time", "created\_at"]**

      **},**

      **"gap\_analysis": {**

        **"fields": \["gap\_id", "user\_id", "current\_role", "target\_role", "transferable\_skills", "skill\_gaps", "gap\_severity", "created\_at"]**

      **},**

      **"interview\_sessions": {**

        **"fields": \["session\_id", "user\_id", "domain", "questions", "transcripts", "vocal\_metrics", "content\_scores", "overall\_confidence", "feedback", "created\_at"]**

      **},**

      **"user\_progress": {**

        **"fields": \["progress\_id", "user\_id", "session\_history", "filler\_trend", "pace\_trend", "confidence\_trend", "updated\_at"]**

      **}**

    **}**

  **},**

  **"api\_routes": {**

    **"auth": \[**

      **"POST /api/auth/register",**

      **"POST /api/auth/login",**

      **"GET /api/auth/profile"**

    **],**

    **"skill\_discovery": \[**

      **"POST /api/discovery/generate-test",**

      **"POST /api/discovery/evaluate",**

      **"GET /api/discovery/domains",**

      **"POST /api/discovery/select-domain",**

      **"GET /api/discovery/roadmap"**

    **],**

    **"gap\_analysis": \[**

      **"POST /api/gap/generate-test",**

      **"POST /api/gap/evaluate",**

      **"GET /api/gap/results",**

      **"GET /api/gap/roadmap"**

    **],**

    **"mock\_interview": \[**

      **"POST /api/interview/generate-questions",**

      **"POST /api/interview/upload-audio",**

      **"POST /api/interview/transcribe",**

      **"POST /api/interview/analyze",**

      **"GET /api/interview/feedback",**

      **"GET /api/interview/progress"**

    **]**

  **}**

**}**









## **Initial Environment Setup Guide (Manual)**

**Follow these steps one by one in your terminal before you start vibe coding with any AI model.**



**Step 1 — Install Prerequisites Make sure you have Node.js (version 18 or above) and npm installed. You can verify by running:**



**text**



**node --version**

**npm --version**

**Step 2 — Create the Next.js Project**



**text**



**npx create-next-app@latest nextstep-ai**

**When prompted, select these options:**



**text**



**Would you like to use TypeScript? → No**

**Would you like to use ESLint? → Yes**

**Would you like to use Tailwind CSS? → Yes**

**Would you like to use src/ directory? → Yes**

**Would you like to use App Router? → Yes**

**Would you like to use Turbopack? → No**

**Would you like to customize import alias? → No**

**Step 3 — Navigate into the Project**



**text**



**cd nextstep-ai**

**Step 4 — Install All Required Dependencies**



**text**



**npm install mongodb mongoose next-auth bcryptjs axios assemblyai @google/generative-ai react-icons recharts**

**Step 5 — Create the Environment File Create a file named .env.local in the root folder and paste this:**



**text**



**MONGODB\_URI=your\_mongodb\_connection\_string**

**GOOGLE\_GEMINI\_API\_KEY=your\_gemini\_api\_key**

**ASSEMBLYAI\_API\_KEY=your\_assemblyai\_api\_key**

**NEXTAUTH\_SECRET=any\_random\_secret\_string**

**NEXTAUTH\_URL=http://localhost:3000**

**Replace the placeholder values with your actual keys.**



**Step 6 — Create the Folder Structure Run this in your terminal from the project root:**



**text**



**mkdir -p src/app/api/auth/register**

**mkdir -p src/app/api/auth/login**

**mkdir -p src/app/api/discovery/generate-test**

**mkdir -p src/app/api/discovery/evaluate**

**mkdir -p src/app/api/discovery/domains**

**mkdir -p src/app/api/discovery/select-domain**

**mkdir -p src/app/api/discovery/roadmap**

**mkdir -p src/app/api/gap/generate-test**

**mkdir -p src/app/api/gap/evaluate**

**mkdir -p src/app/api/gap/results**

**mkdir -p src/app/api/gap/roadmap**

**mkdir -p src/app/api/interview/generate-questions**

**mkdir -p src/app/api/interview/upload-audio**

**mkdir -p src/app/api/interview/transcribe**

**mkdir -p src/app/api/interview/analyze**

**mkdir -p src/app/api/interview/feedback**

**mkdir -p src/app/api/interview/progress**

**mkdir -p src/app/(pages)/dashboard**

**mkdir -p src/app/(pages)/discovery**

**mkdir -p src/app/(pages)/gap-analysis**

**mkdir -p src/app/(pages)/mock-interview**

**mkdir -p src/app/(pages)/login**

**mkdir -p src/app/(pages)/register**

**mkdir -p src/lib**

**mkdir -p src/models**

**mkdir -p src/components**

**Step 7 — Verify Everything Runs**



**text**



**npm run dev**

**Open http://localhost:3000 in your browser. If you see the default Next.js page, your setup is complete.**



## **module wise json prompts:**



**{**

  **"vibe\_coding\_plan": {**

    **"total\_modules": 7,**

    **"estimated\_completion": "5-7 days with focused AI-assisted coding",**

    **"execution\_order": \[**

      **"Module 0 — Database and Core Setup",**

      **"Module 1 — Authentication System",**

      **"Module 2 — Skill Discovery",**

      **"Module 3 — Gap Analysis",**

      **"Module 4 — Mock Interview Platform",**

      **"Module 5 — Dashboard and Progress Tracking",**

      **"Module 6 — UI Polish and Final Integration"**

    **],**



###     **"module\_0": {**

      **"name": "Database and Core Setup",**

      **"priority": "Do this first. Everything else depends on it.",**

      **"prompt\_to\_ai": "I am building a Next.js application called NextStep AI using the App Router inside the src directory. I need you to set up the following foundational files. First, create a MongoDB connection utility at src/lib/mongodb.js that uses mongoose to connect to MongoDB. It should read the connection string from process.env.MONGODB\_URI and cache the connection so it does not reconnect on every API call. Use a global promise caching pattern. Second, create a Gemini AI utility at src/lib/gemini.js that imports GoogleGenerativeAI from the @google/generative-ai package, initializes it using process.env.GOOGLE\_GEMINI\_API\_KEY, and exports a helper function called askGemini that takes a prompt string and returns the text response from the gemini-2.0-flash model. The function should handle errors gracefully and return a clean string. Third, create an AssemblyAI utility at src/lib/assemblyai.js that imports the AssemblyAI package, initializes the client using process.env.ASSEMBLYAI\_API\_KEY, and exports a helper function called transcribeAudio that takes an audio file URL or path and returns the full transcript text along with the word-level timestamps and confidence scores. Fourth, create the following Mongoose models in src/models. User.js with fields name as string required, email as string required unique, password as string required, userType as string with enum values student and professional, collegeName as string, yearOfStudy as string, currentRole as string, targetRole as string, languagesKnown as array of strings, selectedDomain as string, and timestamps set to true. Assessment.js with fields userId as mongoose ObjectId referencing User, questions as array of objects each having question as string and options as array of strings, answers as array of strings, scores as object, evaluatedLevel as string, strengths as array of strings, weaknesses as array of strings, and timestamps true. Recommendation.js with fields userId as ObjectId referencing User, suggestedDomains as array of objects each having domain as string and matchReason as string, and timestamps true. Roadmap.js with fields userId as ObjectId referencing User, type as string with enum values discovery and gap, domain as string, alreadyCovered as array of strings, toLearn as array of objects each having stage as number and topic as string and estimatedDuration as string, totalEstimatedTime as string, and timestamps true. GapAnalysis.js with fields userId as ObjectId referencing User, currentRole as string, targetRole as string, transferableSkills as array of strings, skillGaps as array of objects each having topic as string and severity as string, and timestamps true. InterviewSession.js with fields userId as ObjectId referencing User, domain as string, questions as array of strings, transcripts as array of strings, vocalMetrics as array of objects each having fillerWords as object and speakingPace as object and pauseAnalysis as object and responseDuration as number, contentScores as array of objects each having relevance as number and clarity as number and depth as number and feedback as string, overallConfidence as number, and timestamps true. UserProgress.js with fields userId as ObjectId referencing User, sessionHistory as array of ObjectIds referencing InterviewSession, fillerTrend as string, paceTrend as string, confidenceTrend as string, and timestamps true. Do not create any pages or frontend components. Only create these utility files and models. Use clean simple code with no TypeScript.",**

      **"files\_expected": \[**

        **"src/lib/mongodb.js",**

        **"src/lib/gemini.js",**

        **"src/lib/assemblyai.js",**

        **"src/models/User.js",**

        **"src/models/Assessment.js",**

        **"src/models/Recommendation.js",**

        **"src/models/Roadmap.js",**

        **"src/models/GapAnalysis.js",**

        **"src/models/InterviewSession.js",**

        **"src/models/UserProgress.js"**

      **],**

      **"testing\_checklist": \[**

        **"Import mongodb.js in a test API route and confirm it connects without error",**

        **"Call askGemini with a simple prompt like suggest a career for a python developer and confirm it returns a string response",**

        **"Confirm all models can be imported without crashing the server"**

      **]**

    **},**



###     **"module\_1": {**

      **"name": "Authentication System",**

      **"priority": "Second. Users must exist before any module works.",**

      **"prompt\_to\_ai": "I am continuing work on my Next.js App Router project called NextStep AI inside the src directory. The MongoDB connection utility is at src/lib/mongodb.js and the User model is at src/models/User.js. I need you to build a complete authentication system. First, create the registration API route at src/app/api/auth/register/route.js. This should be a POST handler that accepts name, email, password, userType which is either student or professional, and optional fields collegeName, yearOfStudy, currentRole, targetRole, and languagesKnown. It should check if a user with that email already exists and return a 400 error if so. It should hash the password using bcryptjs with 12 salt rounds. It should create the user in MongoDB and return a 201 response with the user object excluding the password. Second, create the login API route at src/app/api/auth/login/route.js. This should be a POST handler that accepts email and password. It should find the user by email and return 404 if not found. It should compare the password using bcryptjs and return 401 if wrong. On success it should return the user object without the password and a success message. For now use simple cookie-based or response-based auth without JWT to keep it simple. Third, create the registration page at src/app/(pages)/register/page.js. This should be a clean form with fields for name, email, password, and a dropdown for user type. When the user selects student, show additional fields for college name, year of study, and programming languages known as a multi-select or comma-separated input. When user selects professional, show fields for current role and target role. The form should post to the register API and on success redirect to the login page. Fourth, create the login page at src/app/(pages)/login/page.js with email and password fields that posts to the login API and on success stores the user data in localStorage and redirects to the dashboard page. Style everything using Tailwind CSS with a clean modern dark theme using slate and blue accent colors. Make the forms centered on the page with proper spacing and validation messages shown below each field in red if there are errors. Create a simple Navbar component at src/components/Navbar.js that shows the app name NextStep AI on the left and Login and Register links on the right. If a user is logged in and their data exists in localStorage show their name and a Logout button instead. The Logout button should clear localStorage and redirect to login. Add this Navbar to the root layout at src/app/layout.js.",**

      **"files\_expected": \[**

        **"src/app/api/auth/register/route.js",**

        **"src/app/api/auth/login/route.js",**

        **"src/app/(pages)/register/page.js",**

        **"src/app/(pages)/login/page.js",**

        **"src/components/Navbar.js",**

        **"src/app/layout.js (modified)"**

      **],**

      **"testing\_checklist": \[**

        **"Register a new student user and confirm it appears in MongoDB",**

        **"Register a new professional user and confirm it appears in MongoDB",**

        **"Try registering with the same email twice and confirm it shows an error",**

        **"Login with correct credentials and confirm redirect to dashboard",**

        **"Login with wrong password and confirm it shows an error",**

        **"Confirm Navbar shows user name after login and shows login register links when logged out",**

        **"Confirm Logout clears data and redirects to login"**

      **]**

    **},**



###     **"module\_2": {**

      **"name": "Skill Discovery Module",**

      **"priority": "Third. This is the core module for student users.",**

      **"prompt\_to\_ai": "I am continuing work on my Next.js App Router project NextStep AI. The database connection is at src/lib/mongodb.js, the Gemini utility is at src/lib/gemini.js, and all models are in src/models. User authentication stores user data in localStorage after login including the user \_id, name, email, userType, and languagesKnown. Now I need you to build the complete Skill Discovery module. This module has a multi-step flow and I need both the API routes and the frontend page. Step 1 Proficiency Test Generation. Create API route at src/app/api/discovery/generate-test/route.js. This POST handler receives userId in the body. It fetches the user from MongoDB to get their languagesKnown array. It then calls the Gemini utility with this prompt — You are a technical skill assessor. For a student who knows the following programming languages and technologies \[insert languages array here], generate exactly 10 multiple choice questions to test their proficiency. For each question provide the question text, four options labeled A B C D, and the correct answer. Mix easy medium and hard questions. Return the response as a valid JSON array where each object has fields question, options as array of 4 strings, and correctAnswer as the letter. Only return the JSON array nothing else. The route should parse the Gemini response as JSON, save it to the Assessment collection with the userId and questions, and return the questions to the frontend without the correct answers. Step 2 Proficiency Evaluation. Create API route at src/app/api/discovery/evaluate/route.js. This POST handler receives assessmentId and userAnswers as an array of selected options. It fetches the assessment from MongoDB which contains the correct answers. It compares each answer and calculates the score. Then it calls Gemini with this prompt — A student who knows \[languages] scored \[score] out of 10 on a proficiency test. Here are the questions they got wrong \[list wrong questions]. Based on this performance evaluate their skill level as Beginner or Intermediate or Advanced. List their strengths and weaknesses as arrays of topic names. Return as JSON with fields evaluatedLevel as string, strengths as array of strings, weaknesses as array of strings. Only return valid JSON. Parse the response and update the Assessment document with answers, scores, evaluatedLevel, strengths, and weaknesses. Return the full evaluation to the frontend. Step 3 Domain Suggestion. Create API route at src/app/api/discovery/domains/route.js. This POST handler receives userId. It fetches the latest assessment for this user. It calls Gemini with — Based on the following skill profile of a computer science student. Languages known \[languages]. Skill level \[evaluatedLevel]. Strengths \[strengths]. Weaknesses \[weaknesses]. Suggest exactly 4 suitable technical career domains for this student. For each domain provide the domain name and a one-line reason why it suits this student. Return as a JSON array with fields domain and matchReason. Only return valid JSON. Save to Recommendation collection and return to frontend. Step 4 Domain Selection. Create API route at src/app/api/discovery/select-domain/route.js. This POST handler receives userId and selectedDomain. It updates the User document to set the selectedDomain field. Returns success. Step 5 Roadmap Generation. Create API route at src/app/api/discovery/roadmap/route.js. This POST handler receives userId. It fetches the user to get selectedDomain, languagesKnown, and the latest assessment. It calls Gemini with — A computer science student with the following profile wants to become a \[selectedDomain] professional. They already know \[languages] at \[evaluatedLevel] level. Their strengths are \[strengths] and weaknesses are \[weaknesses]. Create a detailed step-by-step learning roadmap for them. First list what they already know that is relevant under alreadyCovered as an array of strings. Then list what they need to learn in sequential stages. Each stage should have a stage number, topic name, brief description of what to learn, and estimated duration. Also provide a totalEstimatedTime. Return as JSON with fields alreadyCovered as array of strings, toLearn as array of objects with stage and topic and description and estimatedDuration, and totalEstimatedTime as string. Only return valid JSON. Save to Roadmap collection with type set to discovery and return to frontend. Now for the frontend. Create the Skill Discovery page at src/app/(pages)/discovery/page.js. This should be a single page with a stepper or step-based flow that shows the user which step they are on. Step 1 shows a welcome message and a button that says Start Proficiency Test which calls the generate-test API. Step 2 renders the 10 MCQ questions one by one or all at once with radio buttons for each option and a Submit button that calls the evaluate API. Step 3 shows the evaluation results with the score, level, strengths shown as green tags, and weaknesses shown as orange tags. Below that it shows a button called View Suggested Domains which calls the domains API. Step 4 shows the suggested domains as cards with the domain name and match reason. Each card has a Select button that calls the select-domain API. Step 5 shows the personalized roadmap with already covered topics shown with checkmarks and the to-learn stages shown as a vertical timeline with stage number, topic, description, and estimated duration. Show total estimated time at the bottom. Use Tailwind CSS with the same dark slate theme. Make transitions smooth between steps. Show a loading spinner whenever an API call is in progress. Handle errors gracefully with toast-style messages.",**

      **"files\_expected": \[**

        **"src/app/api/discovery/generate-test/route.js",**

        **"src/app/api/discovery/evaluate/route.js",**

        **"src/app/api/discovery/domains/route.js",**

        **"src/app/api/discovery/select-domain/route.js",**

        **"src/app/api/discovery/roadmap/route.js",**

        **"src/app/(pages)/discovery/page.js"**

      **],**

      **"testing\_checklist": \[**

        **"Login as a student user and navigate to discovery page",**

        **"Click Start Proficiency Test and confirm 10 questions appear",**

        **"Answer all questions and submit and confirm evaluation results appear with score and level",**

        **"Confirm strengths and weaknesses are displayed properly",**

        **"Click View Suggested Domains and confirm 4 domain cards appear",**

        **"Select a domain and confirm it moves to roadmap step",**

        **"Confirm roadmap shows already covered topics and new topics to learn in proper sequence",**

        **"Check MongoDB to confirm all data is saved in the correct collections",**

        **"Test with different language combinations to verify Gemini gives different results"**

      **]**

    **},**



###     **"module\_3": {**

      **"name": "Gap Analysis Module",**

      **"priority": "Fourth. Core module for professional or career switcher users.",**

      **"prompt\_to\_ai": "I am continuing work on my Next.js App Router project NextStep AI. All utilities and models are set up. Now I need the complete Gap Analysis module for professional users who want to switch careers. This module follows a similar flow to the Skill Discovery module but is focused on career transition. Step 1 Gap Proficiency Test. Create API route at src/app/api/gap/generate-test/route.js. This POST handler receives userId. It fetches the user from MongoDB to get their currentRole and targetRole. It calls Gemini with — A professional currently working as a \[currentRole] wants to transition to a \[targetRole] position. Generate exactly 15 multiple choice questions to assess their current skills and readiness for the target role. Include 7 questions about their current role expertise and 8 questions about foundational knowledge needed for the target role. For each question provide the question text, four options labeled A B C D, the correct answer, and a tag indicating whether it tests currentRole or targetRole skills. Return as a valid JSON array where each object has fields question, options as array of 4 strings, correctAnswer as the letter, and tag as either current or target. Only return the JSON array. Save to Assessment collection and return questions without correct answers to frontend. Step 2 Gap Evaluation. Create API route at src/app/api/gap/evaluate/route.js. This POST handler receives assessmentId and userAnswers. It evaluates answers against correct answers. It separates the score into currentRoleScore and targetRoleScore based on the tags. It calls Gemini with — A \[currentRole] professional scored \[currentRoleScore] out of 7 on current role questions and \[targetRoleScore] out of 8 on \[targetRole] questions. Here are the target role questions they got wrong \[list wrong target questions]. Identify which skills from their current role are transferable to the target role. Identify the specific skill gaps they need to fill. For each gap assign a severity of Low or Medium or High. Return as JSON with fields transferableSkills as array of strings, skillGaps as array of objects with topic and severity, overallReadiness as a percentage number. Only return valid JSON. Save to GapAnalysis collection and Assessment collection. Return results to frontend. Step 3 Gap Results. Create API route at src/app/api/gap/results/route.js. This GET handler receives userId as a query parameter. It fetches the latest GapAnalysis document for this user and returns it. Step 4 Transition Roadmap. Create API route at src/app/api/gap/roadmap/route.js. This POST handler receives userId. It fetches the user profile and latest GapAnalysis. It calls Gemini with — A \[currentRole] professional is transitioning to \[targetRole]. Their transferable skills are \[transferableSkills]. Their skill gaps are \[list each gap with severity]. Create a focused transition roadmap that skips what they already know and only covers the gaps. Prioritize High severity gaps first then Medium then Low. Each stage should have a stage number, topic name, brief description, and estimated duration. Also provide totalEstimatedTime. Return as JSON with fields skip as array of strings listing transferable skills they can skip, focusAreas as array of objects with stage and topic and description and estimatedDuration and severity, and totalEstimatedTime as string. Only return valid JSON. Save to Roadmap collection with type set to gap. Return to frontend. Now the frontend. Create the Gap Analysis page at src/app/(pages)/gap-analysis/page.js. This should have a step-based flow similar to the discovery page. Step 1 shows the user's current role and target role fetched from their profile with a Start Assessment button. Step 2 renders the 15 questions with radio buttons and a Submit button. Step 3 shows the gap analysis results. Show a readiness meter or progress bar showing overall readiness percentage. Show transferable skills as green badges. Show skill gaps as cards with the topic name and a colored severity indicator where High is red, Medium is orange, and Low is yellow. Below the results show a Generate Transition Roadmap button. Step 4 shows the roadmap with skipped topics shown as greyed out with a checkmark and focus areas shown as a vertical timeline ordered by severity with stage number, topic, description, duration, and a severity badge. Show total estimated time at the bottom. Use the same dark slate Tailwind theme. Loading spinners during API calls. Graceful error handling.",**

      **"files\_expected": \[**

        **"src/app/api/gap/generate-test/route.js",**

        **"src/app/api/gap/evaluate/route.js",**

        **"src/app/api/gap/results/route.js",**

        **"src/app/api/gap/roadmap/route.js",**

        **"src/app/(pages)/gap-analysis/page.js"**

      **],**

      **"testing\_checklist": \[**

        **"Login as a professional user and navigate to gap analysis page",**

        **"Confirm current role and target role are displayed from profile",**

        **"Start assessment and confirm 15 questions appear",**

        **"Submit answers and confirm gap analysis results appear",**

        **"Confirm transferable skills show as green badges",**

        **"Confirm skill gaps show with correct severity colors",**

        **"Confirm readiness percentage displays properly",**

        **"Generate transition roadmap and confirm it only shows gap topics",**

        **"Confirm high severity topics appear first in the roadmap",**

        **"Check MongoDB to confirm all data saved correctly",**

        **"Test with different role combinations like frontend to backend and backend to data scientist"**

      **]**

    **},**



###     **"module\_4": {**

      **"name": "Mock Interview Platform",**

      **"priority": "Fifth. The speech analysis module that ties everything together.",**

      **"prompt\_to\_ai": "I am continuing work on my Next.js App Router project NextStep AI. All utilities are set up including src/lib/assemblyai.js for speech transcription and src/lib/gemini.js for AI reasoning. Now I need the complete Mock Interview module. This is accessible to both student and professional users and uses their selected domain to generate relevant interview questions. The key feature is vocal confidence monitoring using AssemblyAI. Step 1 Question Generation. Create API route at src/app/api/interview/generate-questions/route.js. This POST handler receives userId. It fetches the user to get their selectedDomain or targetRole depending on userType. It calls Gemini with — Generate exactly 5 open-ended interview questions for a \[domain] communication round interview. These should test the candidate's ability to explain technical concepts verbally and clearly. The questions should require explanations not one-word answers. Focus on conceptual understanding and the ability to articulate thoughts. Return as a JSON array of strings where each string is one question. Only return the JSON array. Return the questions to the frontend. Step 2 Audio Upload. Create API route at src/app/api/interview/upload-audio/route.js. This POST handler receives an audio file through FormData. It saves the audio file temporarily in the public/uploads directory with a unique filename using timestamp and random string. It returns the file path or accessible URL. Step 3 Transcription. Create API route at src/app/api/interview/transcribe/route.js. This POST handler receives the audioFilePath. It reads the audio file and sends it to AssemblyAI using the transcribeAudio utility. It should request word-level timestamps from AssemblyAI. It returns the full transcript text, the array of words with their start and end timestamps and confidence, and the overall transcription confidence score. Step 4 Analysis. Create API route at src/app/api/interview/analyze/route.js. This POST handler receives the transcript text, word timestamps array, the original question, and the userId. It performs two parallel analyses. Vocal Analysis done locally in the route without AI. Count filler words by searching the transcript for um, uh, ah, like, you know, basically, actually, so yeah, and right. Store each filler word and its count and the total count. Calculate speaking pace by counting total words and dividing by the total duration in minutes derived from word timestamps to get words per minute. Classify pace as Too Slow if below 100 wpm, Optimal if between 100 and 160 wpm, and Too Fast if above 160 wpm. Detect long pauses by iterating through word timestamps and finding gaps between consecutive words that exceed 2 seconds. Count the number of long pauses and calculate average pause duration. Calculate total response duration from the first word start time to the last word end time. Content Analysis done using Gemini. Send the transcript and original question to Gemini with this prompt — A candidate was asked this interview question: \[question]. They responded with: \[transcript]. Evaluate their response on four criteria each scored from 1 to 10. Relevance meaning how well the answer addresses the question. Clarity meaning how clearly the idea was communicated. Depth meaning how thoroughly the topic was covered. Provide specific feedback on what was good and what could be improved. Also provide 3 specific improvement tips. Return as JSON with fields relevance as number, clarity as number, depth as number, feedback as string, and improvementTips as array of 3 strings. Only return valid JSON. Combine vocal analysis and content analysis into a single response object. Calculate an overallConfidence score as a weighted average where vocal metrics contribute 40 percent and content scores contribute 60 percent. The vocal portion is calculated as 100 minus fillerWordPenalty minus pausePenalty minus pacePenalty where fillerWordPenalty is totalFillers multiplied by 3 capped at 30, pausePenalty is longPausesCount multiplied by 5 capped at 20, and pacePenalty is 0 if optimal and 15 if too slow or too fast. Return everything to the frontend. Step 5 Save Session and Feedback. Create API route at src/app/api/interview/feedback/route.js. This POST handler receives the complete session data including userId, domain, questions array, transcripts array, vocalMetrics array, contentScores array, and overallConfidence. It saves to the InterviewSession collection and returns the saved session. Create API route at src/app/api/interview/progress/route.js. This GET handler receives userId. It fetches all InterviewSession documents for this user sorted by creation date. It calculates trends by comparing the latest 3 sessions. If filler count is decreasing the fillerTrend is Improving. If speaking pace is moving toward optimal range the paceTrend is Improving. If overallConfidence is increasing the confidenceTrend is Improving with a percentage. Save or update in UserProgress collection and return. Now the frontend. Create the Mock Interview page at src/app/(pages)/mock-interview/page.js. This is the most interactive page. The layout should have a left panel and a right panel on desktop and stacked on mobile. The flow works like this. When the user lands on the page they see their domain and a Start Mock Interview button. Clicking it calls the generate-questions API and loads 5 questions. The interface shows one question at a time with a large question card at the top. Below the question there is a Record Answer button. When the user clicks Record Answer it should access the browser microphone using the MediaRecorder API and start recording. Show a recording indicator with a red pulsing dot and a timer showing elapsed time. Show a Stop Recording button. When the user stops recording the audio blob is converted to a webm file and uploaded via the upload-audio API. Then automatically call the transcribe API with the uploaded file path. Then automatically call the analyze API with the transcript and question. While processing show a loading state that says Analyzing your response. Once analysis is complete show the results for that question in a results card below. The results card should show the transcript text in a quote block. Vocal Metrics section showing filler words as a count with each filler word listed, speaking pace in wpm with the classification, long pauses count, and response duration. Content Scores section showing relevance clarity and depth each as a progress bar out of 10 with the number. Feedback text from Gemini. Improvement tips as a numbered list. Overall confidence score for that question shown as a large circular progress indicator. After viewing results the user clicks Next Question to move to the next question. After all 5 questions are answered show a Session Summary page that displays the average vocal metrics across all questions, average content scores, overall session confidence score as a large number, a list of all improvement tips consolidated, and a Save Session button that calls the feedback API. After saving show a View Progress button that navigates to a progress section showing trends. For the progress section either on the same page or as a tab show a line chart using recharts library plotting overallConfidence across sessions on the x axis being session number and y axis being confidence score. Show trend badges for filler trend, pace trend, and confidence trend. Use the same dark slate Tailwind theme throughout. The recording interface should feel clean and not intimidating. Use clear visual cues like green for good metrics, yellow for average, and red for poor. Make the circular confidence indicator prominent. Handle microphone permission denial gracefully with a clear message asking the user to allow microphone access.",**

      **"files\_expected": \[**

        **"src/app/api/interview/generate-questions/route.js",**

        **"src/app/api/interview/upload-audio/route.js",**

        **"src/app/api/interview/transcribe/route.js",**

        **"src/app/api/interview/analyze/route.js",**

        **"src/app/api/interview/feedback/route.js",**

        **"src/app/api/interview/progress/route.js",**

        **"src/app/(pages)/mock-interview/page.js"**

      **],**

      **"testing\_checklist": \[**

        **"Login and navigate to mock interview page and confirm domain is shown",**

        **"Click Start Mock Interview and confirm 5 questions are generated",**

        **"Click Record Answer and confirm browser asks for microphone permission",**

        **"Record a 30 second answer and stop recording",**

        **"Confirm audio uploads successfully",**

        **"Confirm transcript appears after processing",**

        **"Confirm vocal metrics show filler count and speaking pace and pause count",**

        **"Confirm content scores show relevance clarity and depth with progress bars",**

        **"Confirm improvement tips are shown",**

        **"Confirm overall confidence score displays as a circular indicator",**

        **"Complete all 5 questions and confirm session summary appears",**

        **"Save session and confirm data is stored in MongoDB",**

        **"Complete a second session and check that progress chart shows both data points",**

        **"Confirm trend badges show Improving or Needs Work correctly",**

        **"Test with a response full of filler words and confirm high filler count",**

        **"Test with a fast-paced response and confirm Too Fast classification",**

        **"Test microphone denial and confirm friendly error message appears"**

      **]**

    **},**



###     **"module\_5": {**

      **"name": "Dashboard and Progress Tracking",**

      **"priority": "Sixth. The central hub that connects all modules.",**

      **"prompt\_to\_ai": "I am continuing work on my Next.js App Router project NextStep AI. All three main modules are built. Now I need a Dashboard page that serves as the central hub after login. Create the dashboard at src/app/(pages)/dashboard/page.js. The page should read user data from localStorage to get the userId and userType. On page load it should make API calls to fetch the user's latest data. The dashboard should have the following sections. Section 1 Welcome Banner. Show a greeting with the user name. Show their user type as a badge either Student or Professional. Show their selected domain or target role if set. Section 2 Module Cards. Show three cards in a row on desktop and stacked on mobile. Card 1 is Skill Discovery with a brain icon and a short description saying Discover your strengths and find your ideal career domain. If the user has completed this module show a green Completed badge and a View Roadmap button. If not show a Start Discovery button. This card is highlighted for student users. Card 2 is Gap Analysis with a chart icon and a short description saying Analyze your skill gaps and get a focused transition plan. If completed show Completed badge and View Roadmap button. If not show Start Analysis button. This card is highlighted for professional users. Card 3 is Mock Interview with a microphone icon and description saying Practice your communication skills with AI-powered feedback. Show the number of sessions completed and a Start Practice button. This card is available to both user types but only if they have a selected domain or target role set. If not show a message saying Complete Skill Discovery or Gap Analysis first. Section 3 Quick Stats. Show a row of stat cards. Total assessments taken. Current skill level. Interview sessions completed. Latest confidence score. Section 4 Recent Activity. Show the last 3 activities like Completed Proficiency Test or Practiced Mock Interview Session 3 with timestamps. For fetching dashboard data create an API route at src/app/api/auth/profile/route.js that is a GET handler receiving userId as query parameter. It fetches the user document. It also fetches the count of assessments and interview sessions for that user. It fetches the latest interview session confidence score. It returns all this data in one response. Also update the Navbar component at src/components/Navbar.js to include navigation links to Dashboard, Skill Discovery, Gap Analysis, and Mock Interview. Highlight the active page. On mobile these links should be in a hamburger menu. The dashboard should also handle the state where the user is brand new and has not done anything yet. In that case show encouraging messages like Ready to begin your journey and point them to the right starting module based on their user type. Use the same dark slate Tailwind theme. Make the dashboard feel like a home base that is clean and not cluttered.",**

      **"files\_expected": \[**

        **"src/app/api/auth/profile/route.js",**

        **"src/app/(pages)/dashboard/page.js",**

        **"src/components/Navbar.js (updated)"**

      **],**

      **"testing\_checklist": \[**

        **"Login as a new student and confirm dashboard shows empty state with Start Discovery prompt",**

        **"Login as a new professional and confirm dashboard highlights Gap Analysis card",**

        **"Complete discovery module and return to dashboard and confirm Completed badge shows",**

        **"Complete a mock interview session and confirm session count updates",**

        **"Confirm quick stats show correct numbers from the database",**

        **"Confirm recent activity shows actual user activities with timestamps",**

        **"Confirm navigation links in Navbar work correctly",**

        **"Test hamburger menu on mobile viewport",**

        **"Confirm Mock Interview card is disabled if no domain is selected yet"**

      **]**

    **},**



###     **"module\_6": {**

      **"name": "UI Polish and Final Integration",**

      **"priority": "Last. Make everything look professional and cohesive.",**

      **"prompt\_to\_ai": "I am finalizing my Next.js App Router project NextStep AI. All modules are functional. Now I need UI polish and integration fixes. First, create a proper landing page at src/app/page.js. This should be a marketing-style homepage that does not require login. It should have a hero section with a large heading saying NextStep AI and a subheading saying Your AI-Powered Career Companion. Below that a brief description of the three modules with icons. A Get Started button that links to the register page. A simple footer with the project name. Second, create a loading component at src/components/Loading.js that shows a centered spinner with a customizable message. Use this component consistently across all pages during API calls. Third, create a toast notification component at src/components/Toast.js that can show success messages in green, error messages in red, and info messages in blue. These should appear at the top right and auto-dismiss after 3 seconds. Integrate this across all pages replacing any alert calls. Fourth, review all pages and ensure consistent spacing, font sizes, and color usage. The color scheme should be slate-900 for backgrounds, slate-800 for cards, blue-500 for primary buttons and accents, green-500 for success states, red-500 for error states, and white for text. Fifth, add proper page titles and meta descriptions for each page using Next.js metadata exports. Sixth, add a protected route check to all pages except the landing page, login, and register. If no user data exists in localStorage redirect to the login page. Seventh, make sure all pages are fully responsive. Test at mobile 375px, tablet 768px, and desktop 1280px widths. Cards should stack on mobile and grid on desktop. The mock interview page panels should stack on mobile. Eighth, add subtle animations using Tailwind transition classes. Cards should have a slight scale on hover. Page transitions should fade in. Buttons should have hover and active states. Ninth, create an error boundary or error page at src/app/error.js and a not-found page at src/app/not-found.js both styled consistently with the theme.",**

      **"files\_expected": \[**

        **"src/app/page.js (landing page)",**

        **"src/components/Loading.js",**

        **"src/components/Toast.js",**

        **"src/app/error.js",**

        **"src/app/not-found.js",**

        **"All existing pages refined and polished"**

      **],**

      **"testing\_checklist": \[**

        **"Visit the landing page without login and confirm it displays properly",**

        **"Click Get Started and confirm it goes to register",**

        **"Try accessing dashboard without login and confirm redirect to login",**

        **"Check all pages at 375px mobile width and confirm nothing overflows or breaks",**

        **"Check all pages at 768px tablet width",**

        **"Check all pages at 1280px desktop width",**

        **"Confirm loading spinners appear during all API calls",**

        **"Confirm toast notifications appear for success and error cases",**

        **"Confirm hover animations work on cards and buttons",**

        **"Visit a nonexistent URL and confirm the not-found page appears",**

        **"Run through the entire user journey from registration to mock interview and confirm smooth flow",**

        **"Check that page titles appear correctly in browser tabs"**

      **]**

    **}**

  **},**



  **"execution\_tips": {**

    **"tip\_1": "Complete modules in the exact order listed. Each module depends on the previous one.",**

    **"tip\_2": "After each module, run through every item in the testing checklist before moving to the next module.",**

    **"tip\_3": "If the AI model generates code with import errors, share the exact error message and the file structure so it can fix the paths.",**

    **"tip\_4": "Keep your .env.local file safe and never commit it to version control.",**

    **"tip\_5": "After Module 0, test the Gemini and MongoDB connections independently before building features on top of them.",**

    **"tip\_6": "If Gemini returns malformed JSON, ask the AI to add a JSON sanitization step that strips markdown code blocks and trims whitespace before parsing.",**

    **"tip\_7": "For the audio recording in Module 4, if the browser blocks microphone access on localhost, make sure you are using http://localhost:3000 and not the IP address.",**

    **"tip\_8": "Commit your code to Git after completing each module so you can roll back if something breaks."**

  **}**

**}**

