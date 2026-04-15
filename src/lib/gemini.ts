import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY!;

if (!GOOGLE_GEMINI_API_KEY) {
  throw new Error('Please define the GOOGLE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

export async function askGemini(prompt: string): Promise<string> {
  // More stable models first; gemini-2.5-flash is experimental and prone to 503s
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-pro'];
  let lastError;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Gemini API error with ${modelName}:`, error);
      lastError = error;
      // For 404 (model not found), try the next model
      if (error instanceof Error && error.message.includes('404')) {
        continue;
      }
      // For 429 (quota), wait briefly then try next model
      if (error instanceof Error && error.message.includes('429')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      // For 503 (overloaded/unavailable), try the next model
      if (error instanceof Error && error.message.includes('503')) {
        continue;
      }
      // For other errors, still try next model instead of giving up
      continue;
    }
  }
  
  throw new Error(`Failed to get response from Gemini after trying all models. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

export function sanitizeJsonResponse(response: string): string {
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  // Trim whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

export default genAI;

