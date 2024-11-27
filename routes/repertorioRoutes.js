const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Função auxiliar para validar URLs
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Rota: Listar todas as músicas
router.get('/', (req, res) => {
  db.all('SELECT * FROM repertorio', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota: Adicionar uma nova música
router.post('/', (req, res) => {
  const { music, youtube, cifra } = req.body;

  if (!music) {
    return res.status(400).json({ error: 'O campo "music" é obrigatório.' });
  }

  if (youtube && !isValidURL(youtube)) {
    return res.status(400).json({ error: 'O campo "youtube" deve ser uma URL válida.' });
  }

  if (cifra && !isValidURL(cifra)) {
    return res.status(400).json({ error: 'O campo "cifra" deve ser uma URL válida.' });
  }

  db.run(
    'INSERT INTO repertorio (music, youtube, cifra) VALUES (?, ?, ?)',
    [music, youtube, cifra],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, music, youtube, cifra });
    }
  );
});

// Rota: Remover uma música pelo ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM repertorio WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }

    res.json({ message: 'Música removida com sucesso.' });
  });
});

module.exports = router;
