const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const seq = require('./database', 'sequelize');
const middlewares = require('./middlewares');
//Fecha de hoy para el pedido
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '/' + mm + '/' + dd;

router.use(parser.json());

router.route('/')
  .get(middlewares.autentication, (req, res) => {
    var id = req.user.id;
    seq.query(`SELECT * FROM users WHERE user_id=${id}`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {
            //Si es administrador traigo todos los pedidos cargados
            if (resultados[0].rol_id == 1) {
                seq.query(`SELECT * from  order_header
                            INNER JOIN order_items ON order_header.order_id = order_items.order_id
                            INNER JOIN products ON order_items.prod_id = products.prod_id`,
                { type: seq.QueryTypes.SELECT }
                )
                .then((resultados) => {
                    if (resultados!=""){
                        res.status(200).send("Listado de pedidos" + JSON.stringify(resultados))
                    } else{
                        res.status(404).send("No se encontraron pedidos")
                    }
                })
                 
            } else {
                //Si es usuario traigo sólo los pedidos asociados a su id
                seq.query(`SELECT * from  order_header
                            INNER JOIN order_items ON order_header.order_id = order_items.order_id
                            INNER JOIN products ON order_items.prod_id = products.prod_id
                            WHERE order_header.user_id = ${id}`,
                { type: seq.QueryTypes.SELECT }
                )
                .then((resultados) => {
                    if (resultados!=""){
                        res.status(200).send("Listado de pedidos" + JSON.stringify(resultados))
                    } else{
                        res.status(404).send("No se encontraron pedidos")
                    }
                })
            }
        });
  })
  .post(middlewares.autentication, (req, res) => {
    var id = req.user.id;
    var order = req.body;
    var order_id;
    seq.query(`INSERT INTO order_header (order_date, user_id, payment_id, status_id, order_total) 
                VALUES ('${today}', ${id}, :payment_id, 1, 0)`
    , { replacements: order }
    )
    .then(resultados => {
        order_id = JSON.stringify(resultados[0])
        res.redirect(`orders/${order_id}/items`)
    });
  })

router.route('/:order_id/items')
    .get(middlewares.autentication, (req, res) => {
        //res.send("Redireccionado correctamente")
    })
    .post(middlewares.autentication, (req, res) => {
        var order = req.params.order_id;
        var item_price;
        var prod_id = req.body.prod_id;
        seq.query(`SELECT prod_price FROM products WHERE prod_id=${prod_id}`
        )
        .then(resultados => {
            item_price = JSON.stringify(resultados[0])
        })
        seq.query(`INSERT INTO order_items (order_id, prod_id, item_cant, item_price) 
                VALUES ('${order}', :prod_id, :item_cant, :item_cant*${item_price}`
        , { replacements: order }
        )
        .then(resultados => {
        order_id = JSON.stringify(resultados[0])
        res.redirect(`orders/${order_id}/items`)
        });

    })

  module.exports = router;