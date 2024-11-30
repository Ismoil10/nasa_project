
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const app = express();

const api = require('./routes/api');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
}));

const accessLog = fs.createWriteStream(path.join(__dirname, 'logs', 'morgan.log'), {flags: 'a'});

app.use(morgan('combined', { stream: accessLog }));

app.use('/v1', api);
app.use(express.static(path.join(__dirname, '..', 'public')));

//console.log(fs);
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;