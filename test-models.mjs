import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  try {
    // Note: listModels is not directly on genAI in some versions, 
    // but we can try to find where it is or just try several model names.
    console.log("Checking gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("test");
    console.log("gemini-1.5-flash works!");
  } catch (e) {
    console.error("gemini-1.5-flash failed:", e.message);
  }

  try {
    console.log("Checking gemini-1.5-flash-latest...");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent("test");
    console.log("gemini-1.5-flash-latest works!");
  } catch (e) {
    console.error("gemini-1.5-flash-latest failed:", e.message);
  }
}

listModels();
