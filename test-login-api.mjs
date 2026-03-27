async function testLogin() {
  const url = 'http://localhost:3000/api/auth/login';
  console.log(`Testing ${url}...`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tester1@gmail.com', password: 'Tester@12345' }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    
    try {
      const json = JSON.parse(text);
      console.log('JSON Response:', json);
    } catch (e) {
      console.log('Raw Response (first 500 chars):');
      console.log(text.substring(0, 500));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testLogin();
