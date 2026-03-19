import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoded for testing since we're outside of Next.js context
const GOOGLE_GEMINI_API_KEY = 'AIzaSyARnUbRf-srTttQB5W96ySDMtlgb3yeAps';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    for (const modelName of models) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        console.log(`Model ${modelName} works! Response: ${response.text().substring(0, 20)}...`);
        break;
      } catch (e) {
        console.error(`Model ${modelName} failed: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
