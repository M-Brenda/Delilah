const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const middlewares = require('./middlewares');
const secret = 'D3lil4h!';
const seq = require('./database', 'sequelize');
const jwt = require('jsonwebtoken');
router.use(parser.json());


router.post('/', middlewares.userValidation, (req, res) => {
    var email = req.body.email;
    var user_name = req.body.user_name;
    seq.query(`SELECT * FROM users WHERE (email = '${email}' OR user_name='${user_name}')`,
        { type: seq.QueryTypes.SELECT }
        )
        .then((resultado) => {
            var id= resultado[0].user_id
            const token = jwt.sign({ id }, secret);
            res.status(200).json({"Log in exitoso. Token: ": token });
        })

})

module.exports = router;