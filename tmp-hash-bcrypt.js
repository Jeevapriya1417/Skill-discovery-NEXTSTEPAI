const bcrypt = require('bcryptjs');
const fs = require('fs');

async function test() {
  const plainText = 'Stuinter@123';
  const hashedPassword = await bcrypt.hash(plainText, 12);
  fs.writeFileSync('tmp-hash.txt', hashedPassword);
}

test();
