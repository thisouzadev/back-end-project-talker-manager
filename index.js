const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
const fs = require('fs');

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const TALKER_FILE = 'talker.json';
// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// https://www.geeksforgeeks.org/node-js-fs-readfilesync-method/
const getTalker = (_req, res) => {
  const data = JSON.parse(fs.readFileSync(TALKER_FILE, 'utf-8'));
  res.status(HTTP_OK_STATUS).json(data);
};

const getTalkerId = (req, res, _next) => {
  const { id } = req.params;
  const data = JSON.parse(fs.readFileSync(TALKER_FILE, 'utf-8'));
  const dataID = data.find((item) => item.id === Number(id));

  if (!dataID) { return res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); }
  res.status(HTTP_OK_STATUS).json(dataID);
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email === '') {
    return res.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};
// https://qastack.com.br/programming/8855687/secure-random-token-in-node-js
const generateToken = (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  return res.status(HTTP_OK_STATUS).json({ token });
};

/* const createTalker = async (req, res, _next) => {
  const { name, age, talk } = req.body;
  const newTalker = { id: 5, name, talk, age };
  const data = JSON.parse(fs.readFileSync(TALKER_FILE, 'utf-8'));
  const newList = [...data, newTalker];
  fs.writeFile(TALKER_FILE, JSON.stringify(newList));
  return res.status(201).json(newTalker);
}; */

// recebi ajuda do Lopes - turma13 - tribo C para criar a função createTalker
const createTalker = (req, res, _next) => {
  const { name, age, talk } = req.body;
  const newTalker = {
    id: 5,
    name,
    age,
    talk,
  };

  const talkers = JSON.parse(fs.readFileSync('talker.json', 'utf-8'));
  const newList = [...talkers, newTalker];
  fs.writeFileSync(TALKER_FILE, JSON.stringify(newList));

  return res.status(201).json(newTalker);
};

const isValidToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
};

const isValidName = (req, res, next) => {
  const { name } = req.body;

  if (!name || name === '') {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

const isValidAge = (req, res, next) => {
  const { age } = req.body;

  if (!age || age === '') {
    return res.status(400).json({
      message: 'O campo "age" é obrigatório',
    });
  }
  if (age < 18) {
    return res.status(400).json({
      message: 'A pessoa palestrante deve ser maior de idade',
    });
  }

  next();
};
// lopes me ajudou a entender o pq estava errado meu date
const isValidTalk = (req, res, next) => {
  const { talk } = req.body;
  const { watchedAt, rate } = talk;
  const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/;

  if (!dateRegex.test(watchedAt)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  if (rate < 1 || rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

const isValidTalk2 = (req, res, next) => {
  const { talk } = req.body;

  if (!talk) {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    });
  }
  // ajuda lopes para criar esse if onde verifica se existe watchedAt e rate dentro de talk
  if (!('watchedAt' in talk) || !('rate' in talk)) {
    return res.status(400).json({
      message:
        'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    });
  }
  next();
};

const editTalker = (req, res, _next) => {
  const { name, age, talk } = req.body;
  const { id } = req.params;
  const newTalker = { id: Number(id), name, age, talk };
  const talkers = JSON.parse(fs.readFileSync('talker.json', 'utf-8'));
  const itemTalker = talkers.filter((item) => item.id !== Number(id));
  const newList = [...itemTalker, newTalker];
  fs.writeFileSync(TALKER_FILE, JSON.stringify(newList));
  return res.status(200).json(newTalker);
}; 

const deleteTalker = (req, res, _next) => {
  const { id } = req.params;
  const talkers = JSON.parse(fs.readFileSync('talker.json', 'utf-8'));
  const itemTalker = talkers.filter((item) => item.id !== Number(id));

  fs.writeFileSync(TALKER_FILE, JSON.stringify(itemTalker));

  return res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
};

const searchTalkers = (req, res) => {
const { q } = req.query;
const talkers = JSON.parse(fs.readFileSync('talker.json', 'utf-8'));
const searchTalker = talkers.filter((item) => item.name.includes(q));
if (q === '') {
  return res.status(200).json(talkers);
} if (!searchTalker) {
  return res.status(200).json([]);
}
return res.status(200).json(searchTalker);
};

app.get('/talker', getTalker);
app.get('/talker/search', isValidToken, searchTalkers); // necessario ficar em cima do id para nao confudir a funçao e pegar o id ajuda da monitoria
app.get('/talker/:id', getTalkerId);
app.post('/login', validateEmail, validatePassword, generateToken);
app.post('/talker',
  isValidName,
  isValidToken,
  isValidAge,
  isValidTalk2,
  isValidTalk,
  createTalker);

app.put('/talker/:id',
  isValidName,
  isValidToken,
  isValidAge,
  isValidTalk2,
  isValidTalk,
  editTalker);
app.delete('/talker/:id', isValidToken, deleteTalker);
