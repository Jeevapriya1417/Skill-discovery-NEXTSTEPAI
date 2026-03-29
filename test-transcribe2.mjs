import path from 'path';
import { AssemblyAI } from 'assemblyai';
import fs from 'fs';

async function testTranscribe() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/ASSEMBLYAI_API_KEY=(.*)/);
  const apiKey = match ? match[1].trim() : null;
  
  if (!apiKey) {
    console.error('API KEY NOT FOUND');
    return;
  }

  console.log('Testing with API key:', apiKey.substring(0, 8) + '...');
  const assemblyClient = new AssemblyAI({ apiKey });
  
  const filename = '69be9dd122f6a1ee0fcc1a30_1774100507801_vji06f.webm';
  const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  // Test 1: speech_models as array (new API format)
  console.log('\nTest 1: speech_models as array...');
  try {
    const audioData = fs.readFileSync(fullPath);
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: audioData,
      speech_model: 'universal-2',
    });
    if (transcript.status === 'error') {
      console.error('Test 1 FAILED:', transcript.error);
    } else {
      console.log('Test 1 SUCCESS! Transcript:', transcript.text?.substring(0, 100));
    }
  } catch (err) {
    console.error('Test 1 ERROR:', err.message);
  }
}

testTranscribe();
