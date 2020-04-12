const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const seq = require('./database', 'sequelize');
const middlewares = require('./middlewares');
//Fecha de hoy para el pedido
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '/' + mm + '/' + dd;

router.use(bodyParser.json());

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
    var prod_price;
    var suma_total = 0;
    var item_price;
    seq.query(`INSERT INTO order_header (order_date, user_id, payment_id, status_id, order_total) VALUES ('${today}', ${id}, :payment_id, 1, 0)`
    , { replacements: order }
    )
    .then(resultados => {
        order_id = JSON.stringify(resultados[0])
        var { details } = req.body;
        console.log("DETAILS" + details);
        details.forEach(item => {
            var result ;
            var prod_id = item.prod_id;
            seq.query(`SELECT prod_price FROM products WHERE prod_id=${prod_id}`,
            { type: seq.QueryTypes.SELECT }
            )
            .then((resultados) => {
                result= resultados[0].prod_price
                prod_price = result;
                console.log("resultados 0" + JSON.stringify(resultados[0].prod_price));
                console.log("EL PROD PRICE ES" + prod_price + "cant" + item.item_cant)
                var item_cant = item.item_cant
            
                item_price = prod_price*item_cant
                console.log("mostrAR CANT " + item_cant + "MOSTRAR PROD PRICE" + prod_price + "ITEM PRICE"+ item_price)
                console.log(" TYPE OF" + typeof(item_cant) + item_cant + typeof(prod_price) + prod_price)
                console.log("EL NAN: " + item_price)
                suma_total=item_price + suma_total;
                seq.query(`INSERT INTO order_items (order_id, prod_id, item_cant, item_price) 
                VALUES ('${order_id}', ${item.prod_id}, ${item.item_cant}, ${item_price})`
                , { replacements: details }
                )
                .then(resultados => {
                    seq.query(`UPDATE order_header SET order_total = ${suma_total} WHERE order_id=${order_id} `
                    )
                    .then((resultados) => {
                        console.log("Valor de pedido actualizado")
                    })
                });

            })
        });
        res.send("Pedido agregado con éxito")
    });
})

router.route('/:order_id/items')
    .get(middlewares.autentication, (req, res) => {
        //res.send("Redireccionado correctamente")
    })
    .post(middlewares.autentication, (req, res) => {
        var order = req.params.order_id;
        
        var prod_id = req.body.prod_id;
        var item_price;
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