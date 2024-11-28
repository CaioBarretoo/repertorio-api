const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Rota para listar todas as músicas
router.get('/', async (req, res) => {
  try {
    db.all('SELECT * FROM repertorio', [], (err, rows) => {
      if (err) {
        console.error('Erro ao buscar músicas:', err.message);
        res.status(500).json({ error: 'Erro ao buscar músicas.' });
      } else {
        res.status(200).json(rows);
      }
    });
  } catch (err) {
    console.error('Erro interno ao buscar músicas:', err.message);
    res.status(500).json({ error: 'Erro interno ao buscar músicas.' });
  }
});

// Rota para adicionar várias músicas
router.post('/', async (req, res) => {
  try {
    const musicas = req.body; // Captura o corpo da requisição (JSON enviado)

    if (!Array.isArray(musicas)) {
      return res.status(400).json({ error: 'O corpo da requisição deve ser um array de músicas.' });
    }

    // Validação de cada música no array
    for (const musica of musicas) {
      if (!musica.music || !musica.youtube || !musica.cifra) {
        return res.status(400).json({ error: 'Todos os campos (id, music, youtube, cifra) são obrigatórios.' });
      }
    }

    // Insere cada música no banco de dados
    const insertPromises = musicas.map((musica) =>
      new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO repertorio (id, music, youtube, cifra) VALUES (?, ?, ?, ?)',
          [musica.id, musica.music, musica.youtube, musica.cifra],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      })
    );

    await Promise.all(insertPromises);

    console.log('Músicas adicionadas com sucesso:', musicas);
    res.status(201).json({ message: 'Músicas adicionadas com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar músicas:', err.message);
    res.status(500).json({ error: 'Erro interno ao salvar músicas.' });
  }
});

// Rota para remover uma música pelo ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM repertorio WHERE id = ?', [id], function (err) {
      if (err) {
        console.error(`Erro ao excluir música com id ${id}:`, err.message);
        res.status(500).json({ error: 'Erro ao excluir a música.' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Música não encontrada.' });
      } else {
        console.log(`Música com id ${id} removida com sucesso.`);
        res.status(200).json({ message: 'Música removida com sucesso.' });
      }
    });
  } catch (err) {
    console.error('Erro interno ao excluir música:', err.message);
    res.status(500).json({ error: 'Erro interno ao excluir música.' });
  }
});

module.exports = router;
