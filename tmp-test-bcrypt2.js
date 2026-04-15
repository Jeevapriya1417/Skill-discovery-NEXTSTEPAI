const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2a$12$CRiyvSW3gkJdHrsXjtelYewm.FDzjbWI26E4n7UwDLL3ThanYpFle';
  console.log('stuinter@123:', await bcrypt.compare('stuinter@123', hash));
  console.log('Stuinter@12:', await bcrypt.compare('Stuinter@12', hash));
  console.log('Stu_inter@123:', await bcrypt.compare('Stu_inter@123', hash));
  console.log('Stuinter123:', await bcrypt.compare('Stuinter123', hash));
}
test();
