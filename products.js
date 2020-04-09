const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const seq = require('./database', 'sequelize');

router.use(parser.json());

router.route('/')
  .get((req, res) => {
    seq.query('SELECT * FROM products',
    { type: seq.QueryTypes.SELECT }
    )
    .then((Products => res.send('Lista de productos' + JSON.stringify(Products))));
  })
  .post((req, res) => {
    var product = req.body;
    seq.query('INSERT INTO products (prod_name, prod_price) VALUES (:prod_name, :prod_price)'
    , { replacements: product }
    )
    .then(resultados => res.send(resultados));
  })

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
  


module.exports = router;
