const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2a$12$CRiyvSW3gkJdHrsXjtelYewm.FDzjbWI26E4n7UwDLL3ThanYpFle';
  const plainText = 'Stuinter@123';
  const isValid = await bcrypt.compare(plainText, hash);
  console.log('IsValid:', isValid);
}

test();
