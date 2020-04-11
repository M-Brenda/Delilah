const seq = require('./database', 'sequelize');
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
            console.log(resultado);
            if(resultado!="") {
                console.log("Resultado dentro del if:" + resultado)
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
                        console.log("Email dentro del if:" + resultado)
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
            console.log(resultado);
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
        const autHeader = req.headers.authorization;
        console.log("INGRESO: " + autHeader);
        if (autHeader) {
            const token = autHeader.split(' ')[1];
            jwt.verify(token, secret, (err, data) => {
            if (err) {
                res.status(401).json({ error: 'Token invalido' });
            } else {
                req.user = data;
                var id = data.id;
                console.log("La data es: " + JSON.stringify(data));
                next();
                return id;
            }
        })
        } else {
        res.status(401).json({ error: 'No se recibio un token' });
        }
    },
    isAdmin : (req, res, next) => {
        var id = (req.user.id);
        seq.query(`SELECT * FROM users WHERE user_id=${id}`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultados) => {
            console.log(resultados[0].rol_id)
            if (resultados[0].rol_id == 1) {
                res.status(200);
                next();
               // return(true);
            } else {
                res.send("Debe ser administrador para usar esta funcionalidad").redirect('/users/me');
               // return(false);
            }
        });
    },

    isLoggedIn : function (req, res, next) {
        if (req.user) return next();
        res.redirect('/');
    },

};
module.exports = middlewares;