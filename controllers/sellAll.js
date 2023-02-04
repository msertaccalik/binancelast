const express = require('express');
const router = express.Router();
const {Order} = require('../helpers/buyandsell');
const buySell = require("../helpers/buyandsell");





router.post('/:symbol', (req, res) => {

    buySell.getBalance(req.params.symbol).then((data) => {
        if (data["free"] > 0) {
            buySell.Order(req.params.symbol + 'USDT', (data["free"]), 'SELL').then((sellData) => {
                res.send(sellData);
            });
        }

    });
});



module.exports = router;
