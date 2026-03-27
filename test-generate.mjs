import fs from 'fs';

async function testGenerate() {
  try {
    // 1. First get the user id by logging in
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tester1@gmail.com', password: 'Tester@12345' }),
    });

    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      return;
    }
    const loginData = await loginRes.json();
    const userId = loginData.user.id || loginData.user._id;
    console.log('Logged in User ID:', userId);

    // 2. Test generate questions
    console.log('Testing generate-questions...');
    const genRes = await fetch('http://localhost:3000/api/interview/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const genData = await genRes.text();
    console.log('Generate questions status:', genRes.status);
    console.log('Generate questions response:', genData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testGenerate();
