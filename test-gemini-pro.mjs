import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

async function testGeminiPro() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GOOGLE_GEMINI_API_KEY=(.*)/);
  const apiKey = match ? match[1].trim() : null;

  if (!apiKey) {
    console.error('API KEY NOT FOUND');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const prompt = `Generate exactly 5 open-ended interview questions for a Full stack developer communication round interview.

These questions should:
- Test the candidate's ability to explain technical concepts verbally and clearly
- Require detailed explanations, not one-word answers
- Focus on conceptual understanding and the ability to articulate thoughts
- Cover different aspects like system design, problem-solving, best practices, and real-world scenarios

Return as a valid JSON array of strings where each string is one question.

Only return the JSON array, nothing else.`;

    console.log('Sending prompt to gemini-pro...');
    const result = await model.generateContent(prompt);
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('Gemini error:', error);
  }
}

testGeminiPro();
