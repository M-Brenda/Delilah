const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:1234@localhost:3306/delilahresto');
sequelize.query('SELECT * FROM products',
    { type: sequelize.QueryTypes.SELECT }
).then((Products) => {
    console.log(Products);
});
module.exports = sequelize;