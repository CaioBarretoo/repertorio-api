    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const morgan = require('morgan'); // Importe o morgan

    const app = express();
    const port = 3000; // Porta da API

    app.use(cors());
    app.use(bodyParser.json());
    app.use(morgan('dev')); // Configure o morgan para usar o formato 'dev'

    let repertorio = []; // Array para armazenar o repertório

    // Rota GET para listar o repertório
    app.get('/repertorio', (req, res) => {
      res.json(repertorio);
    });

    // Rota POST para adicionar uma música ao repertório
    app.post('/repertorio', (req, res) => {
      const novaMusica = req.body;
      repertorio.push(novaMusica);
      res.status(201).json(novaMusica);
    });

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });