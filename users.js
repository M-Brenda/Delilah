const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const seq = require('./database', 'sequelize');
const middlewares = require('./middlewares');

router.use(parser.json());

router.route('/')
  .get(middlewares.autentication, middlewares.isAdmin, (req, res) => {
    seq.query('SELECT * FROM users',
    { type: seq.QueryTypes.SELECT }
    )
    .then((Users => {
      res.status(200).send('Lista de usuarios' + JSON.stringify(Users));
   }))
  })

  .post(middlewares.signUp, (req, res) => {
    var user = req.body;
    seq.query('INSERT INTO users (user_name, full_name, email, telephone, address, pass_user, rol_id) VALUES (:user_name, :full_name, :email, :telephone, :address, :pass_user, 2)'
    , { replacements: user }
    )
    .then(User => res.status(200).send("Usuario creado. Tu nombre de usuario es "+ user.user_name));
  })
/*
router.route('/:prod_id')
  .get((req, res) => {
    const id=req.params.prod_id;
    seq.query(`SELECT * FROM products WHERE prod_id = ${id}`,
    { type: seq.QueryTypes.SELECT }
    )
    .then((Products => res.send('Lista de productos' + JSON.stringify(Products))));
  })

  .put((req, res) => {
    const id=req.params.prod_id;
    var producto = req.body;
    seq.query(`UPDATE products SET prod_name = :prod_name, prod_price=:prod_price WHERE prod_id = ${id}`,
    {replacements: producto }
    ) .then(resultados => res.send(resultados));
  })

  .delete((req, res) => {
    var id = req.params.prod_id;
    seq.query(`DELETE FROM products WHERE prod_id=${id}`,
    ) .then(resultados => res.send(resultados));
  })
  
*/

module.exports = router;
