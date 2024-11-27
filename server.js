const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs'); // Para manipular arquivos
const { exec } = require('child_process'); // Para executar comandos no terminal

const app = express();
const port = 3000; // Porta da API
const dataFilePath = './repertorio.json'; // Caminho do arquivo para salvar os dados
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Token do GitHub do ambiente

if (!GITHUB_TOKEN) {
  console.error('Erro: GITHUB_TOKEN não definido. Verifique as variáveis de ambiente.');
  process.exit(1); // Encerrar o servidor se o token não estiver configurado
}

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

// Função para salvar os dados no arquivo JSON e enviar para o GitHub
const salvarDados = () => {
  // Salvar os dados no arquivo JSON
  fs.writeFileSync(dataFilePath, JSON.stringify(repertorio, null, 2));
  console.log('Dados salvos com sucesso no arquivo JSON!');

  // Garantir que o repositório Git está configurado
  exec('git rev-parse --is-inside-work-tree', (error) => {
    if (error) {
      console.log('Repositório Git não encontrado. Inicializando...');
      exec(
        `
        git init &&
        git config user.name "CaioBarretoo" &&
        git config user.email "caio.barret@hotmail.com" &&
        git remote add origin https://github.com/CaioBarretoo/repertorio-api.git
        `,
        (initError, stdout, stderr) => {
          if (initError) {
            console.error(`Erro ao inicializar o repositório Git: ${initError.message}`);
            return;
          }
          console.log('Repositório Git inicializado e remoto configurado com sucesso!');
          realizarPush(); // Realizar o push após configurar o Git
        }
      );
    } else {
      console.log('Repositório Git já inicializado.');
      exec('git remote -v', (remotesError, remotesStdout) => {
        if (remotesError) {
          console.error('Erro ao verificar remotos Git:', remotesError);
          return;
        }
        // Verificar se o repositório remoto 'origin' está configurado corretamente
        if (!remotesStdout.includes('origin')) {
          console.log('Repositório remoto "origin" não encontrado. Configurando...');
          exec(
            `git remote add origin https://github.com/CaioBarretoo/repertorio-api.git`,
            (addRemoteError, addRemoteStdout, addRemoteStderr) => {
              if (addRemoteError) {
                console.error('Erro ao adicionar o repositório remoto:', addRemoteError);
                return;
              }
              console.log('Repositório remoto "origin" configurado com sucesso!');
              realizarPush(); // Realizar o push após configurar o remoto
            }
          );
        } else {
          realizarPush(); // O repositório remoto já está configurado, então faz o push
        }
      });
    }
  });
};

// Função para realizar o commit e push no repositório Git
const realizarPush = () => {
  exec(
    `
    git config user.name "CaioBarretoo" &&
    git config user.email "caio.barret@hotmail.com" &&
    git add ${dataFilePath} && 
    git commit -m "Preparando alterações locais para pull" || echo "Nenhuma alteração local para commit" &&
    git stash save --include-untracked "Backup antes do pull" || echo "Nada para salvar no stash" &&
    git pull origin main --rebase || echo "Nenhuma atualização para sincronizar" &&
    git stash pop || echo "Nada para aplicar do stash" &&
    git add ${dataFilePath} &&
    git commit -m "Atualizando repertório via API" &&
    git push https://${GITHUB_TOKEN}@github.com/CaioBarretoo/repertorio-api.git main
    `,
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
