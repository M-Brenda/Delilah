const express = require('express');
const server = express();
const products = require('./products')
const users = require('./users');
const login = require('./login');

server.listen(3000, () => console.log('Servidor iniciado'));

server.use('/products', products);
server.use('/users', users);
server.use('/login', login)
