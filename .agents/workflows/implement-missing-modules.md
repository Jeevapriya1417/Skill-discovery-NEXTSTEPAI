---
description: How to implement missing NextStep AI modules and features
---

# Workflow: Implementing Missing MVP Features

Follow these steps to bring the project to 100% compliance with `mvp.md`.

### 1. Update User Model
// turbo
1. Modify `src/models/User.ts` to include:
    - `selfRatedSkillLevel` (String enum: Beginner, Intermediate, Advanced)
    - `yearsOfExperience` (Number)
    - `technologiesCurrentlyWorkingWith` (String array)

### 2. Enhance Registration Form
1. Update `src/app/register/page.tsx`:
    - Add a `Select` component for `selfRatedSkillLevel` for students.
    - Add an `Input` for `yearsOfExperience` for professionals.
    - Ensure all new data is sent to `/api/auth/register`.

### 3. Implement Dashboard Progress Visualization
1. Update `src/app/dashboard/page.tsx`:
    - Fetch complete progress data from `/api/interview/progress`.
    - Implement trend indicators (e.g., Lucide `TrendingUp`, `TrendingDown` icons) for filler words and speaking pace.
    - (Optional) Use a charting library or simple CSS bars to show confidence growth over the last 5 sessions.

### 4. Verify Database Records
1. Run a test registration and ensure all fields are correctly stored in MongoDB.
2. Complete a mock interview and verify that `UserProgress` is updated and visible on the dashboard.
