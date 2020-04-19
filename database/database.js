const Sequelize = require('sequelize');
var username = 'root';
var password = '1234';
var host = '3306';

const sequelize = new Sequelize(`mysql://${username}:${password}@localhost:${host}/delilahresto`);

module.exports = sequelize;