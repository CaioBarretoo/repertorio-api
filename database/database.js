const sqlite3 = require('sqlite3').verbose();

// Conexão com o banco de dados
const db = new sqlite3.Database('../repertorio.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    return;
  }
  console.log('Conectado ao banco de dados SQLite.');

  // Criar a tabela se não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS repertorio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      music TEXT NOT NULL,
      youtube TEXT,
      cifra TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela:', err.message);
    }
  });
});

module.exports = db;
