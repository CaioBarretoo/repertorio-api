const express = require('express');
const router = express.Router();
const db = require('../database/firebase');

// Rota para listar todas as músicas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('repertorio').orderBy('id', 'asc').get();
    const musicas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(musicas);
  } catch (err) {
    console.error('Erro ao listar músicas:', err.message);
    res.status(500).json({ error: 'Erro ao listar músicas.' });
  }
});

// Rota para buscar uma música pelo campo "id"
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtém o parâmetro ':id' da URL

    // Busca no Firestore pelo campo "id"
    const querySnapshot = await db
      .collection('repertorio')
      .where('id', '==', parseInt(id)) // Converte o ID para número
      .get();

    // Verifica se o documento foi encontrado
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }

    // Retorna a música encontrada (primeiro documento)
    const musicas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(musicas[0]);
  } catch (err) {
    console.error('Erro ao buscar música:', err.message);
    res.status(500).json({ error: 'Erro ao buscar música.' });
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

// Rota para atualizar uma música pelo ID
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtém o parâmetro ':id' da URL
    const { music, youtube, cifra } = req.body; // Obtém os dados do corpo da requisição

    if (!music && !youtube && !cifra) {
      return res.status(400).json({ error: 'Pelo menos um campo (music, youtube ou cifra) deve ser fornecido para atualização.' });
    }

    // Busca a música no Firestore usando o campo "id"
    const querySnapshot = await db
      .collection('repertorio')
      .where('id', '==', parseInt(id)) // Converte o ID para número
      .get();

    // Verifica se o documento foi encontrado
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }

    // Atualiza a música encontrada (primeiro documento)
    const docRef = querySnapshot.docs[0].ref; // Obtém a referência do documento
    await docRef.update({ music, youtube, cifra }); // Atualiza apenas os campos fornecidos

    res.status(200).json({ message: 'Música atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar música:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar música.' });
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
