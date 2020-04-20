const seq = require('../database/database', 'sequelize');
const bodyParser = require('body-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const secret = 'D3lil4h!';

router.use(bodyParser.json());

const middlewares = {
    signUp : (req, res, next) => {
        var user_name = req.body.user_name;
        var email = req.body.email;
        var user_existe;
        var email_existe;
        seq.query(`SELECT * FROM users WHERE user_name = '${user_name}'`, 
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultado) => {
            if(resultado!="") {
                user_existe= resultado[0].user_name;
            }
            if (user_existe == user_name) { 
            res.status(404).send("El usuario ya se encuentra registrado")
                } else{ 
                    seq.query(`SELECT * FROM users WHERE email = '${email}'`, 
                    { type: seq.QueryTypes.SELECT }
                    )
                    .then((resultado) => {
                        if(resultado!="") {
                        email_existe= resultado[0].email;
                        }
                        if (email_existe == email) { 
                            res.status(404).send("El email ya se encuentra registrado")
                        } else{ 
                            next();
                        }
                    });
                }
        });
    },

    userValidation : (req,res,next) => {
        var user_name = req.body.user_name;
        var email = req.body.email;
        var user_pass = req.body.pass_user;
        seq.query(`SELECT * FROM users WHERE (email = '${email}' OR user_name='${user_name}') AND pass_user='${user_pass}'`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultado) => {
            if(resultado!="") {
                var id = resultado[0].user_id;
                next();
                res.status(200);
            }else{
                res.status(401).json({ error: 'Usuario o contraseña inválidos' });
            }
        })
    },

    autentication : (req, res, next) => {
        var autHeader = req.headers.authorization;
        if (autHeader) {
            var token = autHeader.split(' ')[1];
            jwt.verify(token, secret, (err, data) => {
            if (err) {
                res.status(401).json({ error: 'Token invalido' });
            } else {
                req.user = data;
                var id = data.id;
                next();
                return id;
            }
        })
        } else {
        res.status(401).json({ error: 'No se recibió un token. Inicie sesión para obtenerlo' });
        }
    },
    isAdmin : (req, res, next) => {
        var id = (req.user.id);
        seq.query(`SELECT * FROM users WHERE user_id=${id}`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {

            if (resultados[0].rol_id == 1) {
                res.status(200);
                next();
            } else {
                res.send("Debe ser administrador para usar esta funcionalidad");
            }
        });
    },

    validateIdProduct : (req, res, next) => {
        var id= req.params.prod_id;
        seq.query(`SELECT * FROM products WHERE prod_id=${id}`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {
            if (resultados!="") {
                res.status(200);
                next();
            } else {
                res.status(404).send("Producto no encontrado o inexistente");
            }
        });
    },

    validateNameProduct : (req, res, next) => {
        var name= req.body.prod_name;
        seq.query(`SELECT * FROM products WHERE prod_name='${name}'`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {
            if (resultados!="") {
                res.status(404).send("El producto ya existe");
            } else {
                res.status(200);
                next();
            }
        });
    }

};
module.exports = middlewares;