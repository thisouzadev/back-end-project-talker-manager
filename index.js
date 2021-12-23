const express = require('express');
const bodyParser = require('body-parser');

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
const dataID = data.find((item) => item.id === parseInt(id));

if (!dataID) { return res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); }
res.status(HTTP_OK_STATUS).json(dataID);
};

app.get('/talker', getTalker);
app.get('/talker/:id', getTalkerId);