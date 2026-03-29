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
  
  // Test: Use speech_models (PLURAL, new API)
  console.log('\nTest: speech_models array (new API format)...');
  try {
    const audioData = fs.readFileSync(fullPath);
    // Use raw transcripts.submit + poll instead, bypassing SDK validation
    const uploaded = await assemblyClient.files.upload(audioData);
    console.log('Uploaded URL:', uploaded);
    
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: uploaded,
      // Force new param via type override
      ...{ speech_models: ['universal-2'] }
    });
    
    if (transcript.status === 'error') {
      console.error('FAILED:', transcript.error);
    } else {
      console.log('SUCCESS! Transcript:', transcript.text?.substring(0, 100));
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

testTranscribe();
