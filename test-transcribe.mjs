import path from 'path';

// Note: I renamed the import because I'm running from the root and using ESM
// But since the project is TS, I'll just write a quick script that uses the underlying logic

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

  const assemblyClient = new AssemblyAI({ apiKey });
  
  // Use one of the files from the listing
  const filename = '69be9dd122f6a1ee0fcc1a30_1774100507801_vji06f.webm';
  const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  console.log(`Testing transcription for ${fullPath}...`);
  
  try {
    console.log(`Testing transcription with Buffer for ${fullPath}...`);
    const audioData = fs.readFileSync(fullPath);
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: audioData,
      speech_model: 'default',
    });

    if (transcript.status === 'error') {
      console.error('Transcription error:', transcript.error);
    } else {
      console.log('Transcription SUCCESS!');
      console.log('Transcript:', transcript.text?.substring(0, 100));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testTranscribe();
