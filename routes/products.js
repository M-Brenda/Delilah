const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const seq = require('./database', 'sequelize');
const middlewares = require('./middlewares');

router.use(parser.json());

router.route('/')
  .get( middlewares.autentication, (req, res) => {
    seq.query('SELECT * FROM products',
    { type: seq.QueryTypes.SELECT }
    )
    .then((Products => {
      if(Products!=""){
        res.status(200).send('Lista de productos' + JSON.stringify(Products))
    } else{
      res.status(200).send('No se encontraron productos cargados')
    }
    }))
    
  })

  .post(middlewares.autentication, middlewares.isAdmin, middlewares.validateNameProduct, (req, res) => {
    var product = req.body;
    seq.query('INSERT INTO products (prod_name, prod_price) VALUES (:prod_name, :prod_price)'
    , { replacements: product }
    )
    .then(resultados => res.status(200).send("Producto agregado con éxito"));
  })

router.route('/:prod_id')
  .get(middlewares.autentication, middlewares.validateIdProduct, (req, res) => {
    const id=req.params.prod_id;
    seq.query(`SELECT * FROM products WHERE prod_id = ${id}`,
    { type: seq.QueryTypes.SELECT }
    )
    .then((Products => res.status(200).send('Producto: ' + JSON.stringify(Products))));
  })

  .put(middlewares.autentication, middlewares.isAdmin, middlewares.validateIdProduct, (req, res) => {
    const id=req.params.prod_id;
    var producto = req.body;
    seq.query(`UPDATE products SET prod_name = :prod_name, prod_price=:prod_price WHERE prod_id = ${id}`,
    {replacements: producto }
    ) .then(resultados => res.status(200).send("Producto actualizado con éxito"));
  })

  .delete(middlewares.autentication, middlewares.isAdmin, middlewares.validateIdProduct, (req, res) => {
    var id = req.params.prod_id;
    seq.query(`DELETE FROM products WHERE prod_id=${id}`,
    ) .then(resultados => res.status(200).send("Producto eliminado con éxito"));
  })

module.exports = router;
