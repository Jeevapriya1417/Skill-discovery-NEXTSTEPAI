import { askGemini, sanitizeJsonResponse } from './src/lib/gemini.ts'; // Import from project TS if possible, but easier to just mock it
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

// We simulate the feedback API's prompt logic to ensure Gemini gives a good response
const domain = "Cloud Architect";
const allTranscripts = `
Section 1 (Introduction): I am a cloud engineer with 5 years of experience in AWS and Azure. I love building scalable systems.

---

Section 2, Q1 (What is the difference between S3 and EBS?): S3 is object storage for the web, while EBS is block storage for EC2 instances. S3 is highly durable and cost-effective for large files.

---

Section 2, Q2 (Explain the Shared Responsibility Model.): AWS is responsible for security 'of' the cloud (hardware, regions), while the customer is responsible for security 'in' the cloud (data, IAM, OS).

---

Section 3, Q1 (How would you handle a sudden traffic spike in a production environment?): I would use Auto Scaling to add more instances, along with a Load Balancer to distribute traffic. I'd also check if caching could offload some DB pressure.

---

Section 4 (Topic: Future of Serverless): Serverless will continue to grow because it removes the operational burden. It's great for event-driven apps but has cold start challenges.
`;

async function testBulkPrompt() {
  console.log('--- Testing Bulk Gemini Evaluation Prompt ---');
  
  const bulkPrompt = `Task: Perform a comprehensive evaluation of the following mock interview for a ${domain} role.

INTERVIEW CONTEXT:
${allTranscripts}

Based on all the answers above, provide a detailed evaluation.
1. Technical Score (0-100): Based on the accuracy and depth of technical answers.
2. Problem Solving Score (0-100): Based on the logical approach in Section 3.
3. Content Summary:
   - Relevance (0-100): Overall stay on topic score.
   - Clarity (0-100): Overall communication clarity.
   - Depth (0-100): Overall thoroughness of technical explanations.
4. Section Scores:
   - Section 1 Score (0-100): Introduction quality.
   - Section 2 Score (0-100): Domain knowledge accuracy.
   - Section 3 Score (0-100): Problem solving quality.
   - Section 4 Score (0-100): General speaking fluency.
5. Provide 4 personalized improvement tips.
6. Provide a 2-3 sentence overall conclusion.

Return ONLY a valid JSON object:
{
  "technicalScore": Number,
  "problemSolvingScore": Number,
  "contentSummary": {
    "relevance": Number,
    "clarity": Number,
    "depth": Number
  },
  "sectionScores": {
    "s1": Number,
    "s2": Number,
    "s3": Number,
    "s4": Number
  },
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "conclusion": "string"
}`;

  console.log('Sending prompt to Gemini...');
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(bulkPrompt);
    const responseText = result.response.text();
    
    // Use the same cleanup logic as our lib
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const json = JSON.parse(cleaned);
    
    console.log('--- VERIFICATION SUCCESS ---');
    console.log('JSON Report Preview:');
    console.log(JSON.stringify(json, null, 2));
    
  } catch (err) {
    console.error('VERIFICATION FAILED:', err.message);
  }
}

testBulkPrompt();
