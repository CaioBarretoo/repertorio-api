const express = require('express');
const router = express.Router();
const db = require('../firebase');

// Rota para listar todas as músicas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('repertorio').get();
    const musicas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(musicas);
  } catch (err) {
    console.error('Erro ao buscar músicas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar músicas.' });
  }
});

// Rota para adicionar várias músicas
router.post('/', async (req, res) => {
  try {
    const musicas = req.body;

    if (!Array.isArray(musicas)) {
      return res.status(400).json({ error: 'O corpo da requisição deve ser um array de músicas.' });
    }

    const batch = db.batch();

    musicas.forEach(musica => {
      if (!musica.music || !musica.youtube || !musica.cifra) {
        throw new Error('Todos os campos (music, youtube, cifra) são obrigatórios.');
      }
      const docRef = db.collection('repertorio').doc();
      batch.set(docRef, musica);
    });

    await batch.commit();
    res.status(201).json({ message: 'Músicas adicionadas com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar músicas:', err.message);
    res.status(500).json({ error: 'Erro ao salvar músicas.' });
  }
});

// Rota para remover uma música pelo ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection('repertorio').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Música removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir música:', err.message);
    res.status(500).json({ error: 'Erro ao excluir música.' });
  }
});

module.exports = router;
