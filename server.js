const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs'); // Para manipular arquivos
const { exec } = require('child_process'); // Para executar comandos no terminal


const app = express();
const port = 3000; // Porta da API
const dataFilePath = './repertorio.json'; // Caminho do arquivo para salvar os dados

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev')); // Configura o morgan para usar o formato 'dev'

let repertorio = [];

// Função para carregar dados do arquivo JSON
const carregarDados = () => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    repertorio = JSON.parse(data);
    console.log('Dados carregados com sucesso!');
  } else {
    console.log('Nenhum dado encontrado. Iniciando com repertório vazio.');
  }
};

// Função para salvar os dados no arquivo JSON e enviá-los ao GitHub
const salvarDados = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify(repertorio, null, 2));
  console.log('Dados salvos com sucesso no arquivo JSON!');

  // Adicionando mudanças ao Git e enviando ao GitHub
  exec(
    `git add ${dataFilePath} && git commit -m "Atualizando repertório via API" && git push`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar comandos Git: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Erro no Git: ${stderr}`);
        return;
      }
      console.log(`Mudanças enviadas para o GitHub:\n${stdout}`);
    }
  );
};

// Carregar os dados ao iniciar o servidor
carregarDados();

// Rota GET para listar o repertório
app.get('/repertorio', (req, res) => {
  res.json(repertorio);
});

// Rota POST para adicionar uma música ou várias músicas ao repertório
app.post('/repertorio', (req, res) => {
  const entrada = req.body;

  if (Array.isArray(entrada)) {
    repertorio.push(...entrada);
  } else {
    repertorio.push(entrada);
  }

  salvarDados(); // Salvar os dados sempre que houver alterações
  res.status(201).json({ message: 'Adicionado com sucesso!', data: entrada });
});

// Salvar os dados ao fechar o servidor
process.on('SIGINT', () => {
  console.log('\nEncerrando servidor...');
  salvarDados();
  process.exit();
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
