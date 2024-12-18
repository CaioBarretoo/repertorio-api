const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Importando Morgan
const repertorioRoutes = require('./routes/repertorioRoutes');

const app = express();
const PORT = process.env.PORT || 3000; // Porta do Render

// Configuração do Morgan para logs detalhados
app.use(morgan((tokens, req, res) => {
  return [
    `[${new Date().toISOString()}]`,                      // Timestamp
    tokens.method(req, res),                              // Método (GET, POST, DELETE, etc.)
    tokens.url(req, res),                                 // URL requisitada
    `- Status: ${tokens.status(req, res)}`,               // Status da resposta
    `- Tempo: ${tokens['response-time'](req, res)}ms`,    // Tempo de resposta
    `- Tamanho: ${tokens.res(req, res, 'content-length') || '0'}b` // Tamanho da resposta
  ].join(' ');
}));

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/repertorio', repertorioRoutes);

// Rota principal (opcional)
app.get('/', (req, res) => {
  res.send('API está funcionando! Acesse /repertorio para gerenciar as músicas.');
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
