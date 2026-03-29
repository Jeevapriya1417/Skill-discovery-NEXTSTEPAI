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

  console.log('Testing AssemblyAI Final Verification...');
  const assemblyClient = new AssemblyAI({ apiKey });
  
  const filename = '69be9dd122f6a1ee0fcc1a30_1774100507801_vji06f.webm';
  const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  try {
    const audioData = fs.readFileSync(fullPath);
    console.log('Uploading audio...');
    const uploaded = await assemblyClient.files.upload(audioData);
    console.log('Upload success:', uploaded);
    
    console.log('Requesting transcription with speech_models: ["universal-3-pro", "universal-2"]...');
    // We use the exact same logic as our updated src/lib/assemblyai.ts
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: uploaded,
      ...{ speech_models: ['universal-3-pro', 'universal-2'] }
    });
    
    if (transcript.status === 'error') {
      console.error('TRANSCRIPTION FAILED:', transcript.error);
    } else {
      console.log('TRANSCRIPTION SUCCESS!');
      console.log('Transcript Text:', transcript.text?.substring(0, 500));
    }
  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
  }
}

testTranscribe();
