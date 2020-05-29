require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./db');
const router = require('./routes/index');
const port = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet.xssFilter());
app.use(router);

db.on('connected', () => {
  console.log('Connected to database.');
  app.listen(port, () => console.log(`Server is listening on port ${port}...`));
});