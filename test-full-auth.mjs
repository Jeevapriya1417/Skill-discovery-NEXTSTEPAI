async function testRegisterAndLogin() {
  const baseUrl = 'http://localhost:3000';
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password@123';
  
  console.log(`Testing registration with ${email}...`);
  try {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
        userType: 'student',
        collegeName: 'Test College',
        yearOfStudy: '3rd Year',
        selfRatedSkillLevel: 'Intermediate',
        languagesKnown: 'JavaScript, TypeScript'
      }),
    });
    
    const regData = await regRes.json();
    console.log('Registration Status:', regRes.status);
    console.log('Registration Data:', regData);
    
    if (!regRes.ok) return;
    
    console.log(`Testing login with ${email}...`);
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Data:', loginData);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRegisterAndLogin();
