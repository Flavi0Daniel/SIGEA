const bcrypt = require('bcrypt');

//const senha = 'novaSenha456';
const senha = 'senhaprofessora1';

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash gerado:', hash);
});
