import fs from 'fs';

async function listModels() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GOOGLE_GEMINI_API_KEY=(.*)/);
  const apiKey = match ? match[1].trim() : null;

  if (!apiKey) {
    console.error('API KEY NOT FOUND');
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log('Error listing models:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
