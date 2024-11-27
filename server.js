const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Importa o morgan

const app = express();
const port = 3000; // Porta da API

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev')); // Configura o morgan para usar o formato 'dev'

let repertorio = []; // Array para armazenar o repertório

// Rota GET para listar o repertório
app.get('/repertorio', (req, res) => {
  res.json(repertorio);
});

// Rota POST para adicionar uma música ou várias músicas ao repertório
app.post('/repertorio', (req, res) => {
  const entrada = req.body;

  // Verifica se a entrada é um array ou um objeto único
  if (Array.isArray(entrada)) {
    repertorio.push(...entrada); // Adiciona todas as músicas do array
  } else {
    repertorio.push(entrada); // Adiciona apenas a música única
  }

  res.status(201).json({ message: 'Adicionado com sucesso!', data: entrada });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
