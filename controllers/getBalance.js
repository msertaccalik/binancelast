const express = require('express');
const router = express.Router();
const {getAccount} = require("../helpers/buyandsell");


router.get('/', (req, res) => {

    getAccount().then((data) => {
        res.send(data);
    });
});


router.get('/:symbol', (req, res) => {
    getAccount(req.params.symbol).then((data) => {
        res.send(data);
    });
});


module.exports = router;
