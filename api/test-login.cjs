const bcrypt = require('bcryptjs');

// Test the password hash from migration file
const hash = '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS';
const password = 'demo123456';

bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);
  
  // Also test creating a new hash
  bcrypt.hash(password, 10).then(newHash => {
    console.log('New hash:', newHash);
    
    bcrypt.compare(password, newHash).then(newResult => {
      console.log('New hash match:', newResult);
    });
  });
});