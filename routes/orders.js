const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const seq = require('../database/database', 'sequelize');
const middlewares = require('./middlewares');

//Fecha de hoy para el pedido
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //Enero es 0
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
                seq.query(`SELECT ord.order_id, ord.user_id, ord.payment_id, ord.status_id, ord.order_total, 
                            item.item_id, item.item_cant, item.item_price,
                            prod.prod_id, prod.prod_name,
                            us.address, us.email, us.full_name, us.user_name, us.telephone
                            FROM order_header AS ord
                            INNER JOIN order_items AS item ON ord.order_id = item.order_id
                            INNER JOIN products AS prod ON item.prod_id = prod.prod_id
                            INNER JOIN users AS us ON ord.user_id=us.user_id
                            ORDER BY ord.order_id ASC`,
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
                seq.query(`SELECT ord.order_id, ord.user_id, ord.payment_id, ord.status_id, ord.order_total, 
                            item.item_id, item.item_cant, item.item_price,
                            prod.prod_id, prod.prod_name,
                            us.address, us.email, us.full_name, us.user_name, us.telephone
                            FROM order_header AS ord
                            INNER JOIN order_items AS item ON ord.order_id = item.order_id
                            INNER JOIN products AS prod ON item.prod_id = prod.prod_id
                            INNER JOIN users AS us ON ord.user_id=us.user_id
                            WHERE ord.user_id = ${id}
                            ORDER BY ord.order_id ASC`,
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
    insertOrder(id,order).then(result =>{
        if(result===true) {
            res.status(200).send("Pedido agregado con éxito");
        }else{
            res.status(404).send("No se ha podido cargar el pedido")
        }
    })
  })

  
router.route('/:order_id')
    .get(middlewares.autentication, (req, res) => {
        var order_id = req.params.order_id;
        var id = req.user.id;
        seq.query(`SELECT * FROM users WHERE user_id=${id}`,
            { type: seq.QueryTypes.SELECT }
            )
            .then((resultados) => {
                //Si es administrador traigo el pedido con el id ingesado
                if (resultados[0].rol_id == 1) {
                    seq.query(`SELECT ord.order_id, ord.user_id, ord.payment_id, ord.status_id, ord.order_total, 
                                item.item_id, item.item_cant, item.item_price,
                                prod.prod_id, prod.prod_name,
                                us.address, us.email, us.full_name, us.user_name, us.telephone
                                FROM order_header AS ord
                                INNER JOIN order_items AS item ON ord.order_id = item.order_id
                                INNER JOIN products AS prod ON item.prod_id = prod.prod_id
                                INNER JOIN users AS us ON ord.user_id=us.user_id
                                WHERE ord.order_id=${order_id}`,
                    { type: seq.QueryTypes.SELECT }
                    )
                    .then((resultados) => {
                        if (resultados!=""){
                            res.status(200).send("Detalles del pedido: " + JSON.stringify(resultados))
                        } else{
                            res.status(404).send("No se encontraron pedidos")
                        }
                    })
                    
                } else {
                    //Si es usuario traigo sólo el pedido si corresponde a su id de usuario
                    seq.query(`SELECT ord.order_id, ord.user_id, ord.payment_id, ord.status_id, ord.order_total, 
                                item.item_id, item.item_cant, item.item_price,
                                prod.prod_id, prod.prod_name,
                                us.address, us.email, us.full_name, us.user_name, us.telephone
                                FROM order_header AS ord
                                INNER JOIN order_items AS item ON ord.order_id = item.order_id
                                INNER JOIN products AS prod ON item.prod_id = prod.prod_id
                                INNER JOIN users AS us ON ord.user_id=us.user_id
                                WHERE order_header.user_id = ${id} AND order_header.order_id=${order_id}`,
                    { type: seq.QueryTypes.SELECT }
                    )
                    .then((resultados) => {
                        if (resultados!=""){
                            res.status(200).send("Información sobre su pedido" + JSON.stringify(resultados))
                        } else{
                            res.status(404).send("Pedido no encontrado o incorrecto")
                        }
                    })
                }
            });
    })

    .put(middlewares.autentication, middlewares.isAdmin, (req, res) => {
        var order_id = req.params.order_id;
        var status = req.body;
        seq.query(`SELECT * FROM order_header WHERE order_id=${order_id}`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {
            //Si el pedido existe, actualizo su estado
            if (resultados!="") {
                seq.query(`UPDATE order_header SET status_id = :status_id WHERE order_id=${order_id}`,
                {replacements: status }
                ) 
                .then(resultados => res.status(200).send("El estado del pedido ha sido actualizado"))
            }else {
                res.status(404).send("ID de pedido no encontrado")
            }
        
        })
    })

    .delete(middlewares.autentication, middlewares.isAdmin, (req, res) => {
        var order_id = req.params.order_id;
        seq.query(`SELECT * FROM order_header WHERE order_id=${order_id}`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {
            //Si el pedido existe, eliminamos primero los items y luego los datos del pedido
            if (resultados!="") {
                seq.query(`DELETE FROM order_items WHERE order_id=${order_id}`) 
                .then(resultados => 
                    seq.query(`DELETE FROM order_header WHERE order_id=${order_id}`) 
                    .then(resultados => res.status(200).send("El pedido ha sido eliminado"))
                )
            }else {
                res.status(404).send("ID de pedido no encontrado")
            }
        })
    })

    async function insertOrder(id,order) {
        const t = await seq.transaction();
        var order_id;
        var prod_price;
        var suma_total = 0;
        var item_price;
        try {
            const result = await seq.query(`INSERT INTO order_header (order_date, user_id, payment_id, status_id, order_total) VALUES ('${today}', ${id}, :payment_id, 1, 0)` , { replacements: order},{ transaction: t })
            order_id = JSON.stringify(result[0])
            var { details } = order;
            for (item of details){
                var resultado ;
                var prod_id = item.prod_id;
                const result2=await seq.query(`SELECT prod_price FROM products WHERE prod_id=${prod_id}`, { type: seq.QueryTypes.SELECT },{transaction: t })
                resultado= result2[0].prod_price;
                prod_price= resultado;
                var item_cant = item.item_cant
                item_price = prod_price*item_cant
                suma_total=item_price + suma_total;
                const result3= await seq.query(`INSERT INTO order_items (order_id, prod_id, item_cant, item_price) 
                VALUES ('${order_id}', ${item.prod_id}, ${item.item_cant}, ${item_price})`
                ,{ transaction: t })
                const result4= await seq.query(`UPDATE order_header SET order_total = ${suma_total} WHERE order_id=${order_id} `, { transaction: t });  
          }
        await t.commit();
        return  true;
        } catch (error) {
            await t.rollback();
            return error;
        }
    }
    

  module.exports = router;