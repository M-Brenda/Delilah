const express = require('express');
const server = express();
const products = require('./routes/products')
const users = require('./routes/users');
const login = require('./routes/login');
const orders = require('./routes/orders');

server.listen(3000, () => console.log('Servidor iniciado'));

server.use('/products', products);
server.use('/users', users);
server.use('/login', login);
server.use('/orders', orders)
