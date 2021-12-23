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
  console.log(id);
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
  console.log(token);
  return res.status(HTTP_OK_STATUS).json({ token });
};

app.get('/talker', getTalker);
app.get('/talker/:id', getTalkerId);
app.post('/login', validateEmail, validatePassword, generateToken);