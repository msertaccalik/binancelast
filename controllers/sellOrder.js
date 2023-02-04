const express = require('express');
const router = express.Router();
const {Order} = require('../helpers/buyandsell');
const buySell = require("../helpers/buyandsell");



router.post('/:symbol/:qty', (req, res) => {

    Order(req.params.symbol, req.params.qty, 'SELL').then((data) => {
        res.send(data);
    });
});


router.post('/all/:symbol', (req, res) => {

    buySell.getBalance(req.params.symbol.slice(0, -4)).then((data) => {
        if (data["free"] > 0) {
            buySell.Order(req.params.symbol, (data["free"]), 'SELL').then((sellData) => {

            });
        }

    });
});



module.exports = router;
