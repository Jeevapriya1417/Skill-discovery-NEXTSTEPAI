import fs from 'fs';
import path from 'path';

async function testFetchTranscript() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/ASSEMBLYAI_API_KEY=(.*)/);
  const apiKey = match ? match[1].trim() : null;

  if (!apiKey) {
    console.error('API KEY NOT FOUND');
    return;
  }

  const filename = '69be9dd122f6a1ee0fcc1a30_1774100507801_vji06f.webm';
  const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
  const audioData = fs.readFileSync(fullPath);

  try {
    console.log('Uploading file...');
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/octet-stream'
      },
      body: new Blob([audioData])
    });

    const uploadData = await uploadRes.json();
    console.log('Upload response:', uploadData);

    if (!uploadData.upload_url) return;

    console.log('Testing Default (no params):');
    const res1 = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST', headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url: uploadData.upload_url })
    });
    console.log(await res1.json());

    console.log('Testing with language_code "en_us":');
    const res2 = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST', headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url: uploadData.upload_url, language_code: 'en_us' })
    });
    console.log(await res2.json());

    console.log('Testing with speech_model "default":');
    const res3 = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST', headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url: uploadData.upload_url, speech_model: 'default' })
    });
    console.log(await res3.json());

  } catch (e) {
    console.error(e);
  }
}

testFetchTranscript();
