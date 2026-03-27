import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function testGeminiAudio() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GOOGLE_GEMINI_API_KEY=(.*)/);
  const apiKey = match ? match[1].trim() : null;

  if (!apiKey) {
    console.error('API KEY NOT FOUND');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const filename = '69be9dd122f6a1ee0fcc1a30_1774100507801_vji06f.webm';
  const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
  const audioData = fs.readFileSync(fullPath);

  try {
    console.log('Sending audio to Gemini...');
    const result = await model.generateContent([
      {
        inlineData: {
          data: audioData.toString('base64'),
          mimeType: 'audio/webm'
        }
      },
      "Transcribe this audio perfectly. Reply with ONLY the transcript, nothing else."
    ]);

    console.log('Gemini Transcript:', result.response.text());
  } catch (error) {
    console.error('Gemini error:', error);
  }
}

testGeminiAudio();
