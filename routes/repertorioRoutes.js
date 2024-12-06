const express = require('express');
const router = express.Router();
const db = require('../database/firebase');

// Rota para listar todas as músicas ou buscar por um ID específico
router.get('/', async (req, res) => {
  try {
    const { id } = req.query; // Obtém o parâmetro de consulta 'id'

    if (id) {
      // Caso um ID seja passado, busca o documento correspondente
      const docRef = db.collection('repertorio').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Música não encontrada.' });
      }

      return res.status(200).json({ id: doc.id, ...doc.data() });
    } else {
      // Caso contrário, lista todas as músicas
      const snapshot = await db.collection('repertorio').orderBy('id', 'asc').get();
      const musicas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(musicas);
    }
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
    const { id } = req.params; // Captura o ID da URL

    // Consulta documentos onde o campo `id` é igual ao parâmetro fornecido
    const querySnapshot = await db
      .collection('repertorio')
      .where('id', '==', parseInt(id)) // Converte o `id` para número, já que o dado no Firestore é numérico
      .get();

    // Se nenhum documento for encontrado, retorna erro
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }

    // Exclui todos os documentos encontrados (mesmo que seja um único documento)
    const batch = db.batch(); // Usa batch para exclusão
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref); // Adiciona exclusão de cada documento ao batch
    });

    await batch.commit(); // Executa o batch para excluir os documentos

    res.status(200).json({ message: 'Música removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir música:', err.message);
    res.status(500).json({ error: 'Erro ao excluir música.' });
  }
});


module.exports = router;
