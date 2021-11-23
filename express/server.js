'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

//app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, '..')));

app.use(bodyParser.json());
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));


module.exports = app;
module.exports.handler = serverless(app);
