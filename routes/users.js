const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const seq = require('../database/database', 'sequelize');
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

  router.route('/me')
  .get(middlewares.autentication, (req, res) => {
    var id = req.user.id;
    seq.query(`SELECT * FROM users where user_id=${id}`,
    { type: seq.QueryTypes.SELECT }
    )
    .then((Users => {
      res.status(200).send('Mis datos: ' + JSON.stringify(Users));
   }))
  })

  router.route('/:id')
  .get(middlewares.autentication, middlewares.isAdmin, (req, res) => {
    var id = req.params.id;
    seq.query(`SELECT * FROM users where user_id=${id}`,
    { type: seq.QueryTypes.SELECT }
    )
    .then((Users => {
      if(Users!=""){
        res.status(200).send('Datos del usuario: ' + JSON.stringify(Users));
    } else{
        res.status(404).send('No se encontró el usuario')
    }
   }))
  })

module.exports = router;
