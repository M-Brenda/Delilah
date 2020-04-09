const express = require('express');
const server = express();
const products = require('./products')

server.listen(3000, () => console.log('Servidor iniciado'));

server.use('/products', products);

