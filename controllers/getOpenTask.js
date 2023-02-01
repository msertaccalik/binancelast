const express = require('express');
const router = express.Router();
const binancews = require('../socket/binancews');
const db = require('../db/db');
const current = require('../helpers/getCurrentPrice')

router.get('/', (req, res) => {
    current.getCurrentSpot('BTCUSDT').then((data) => {
        res.send(data);
    });
    //res.send(binancews.openedTask());

});

router.get('/all', (req, res) => {
    db.getAllFromDB().then((data) => {
        res.send(data);
    });


});


router.get('/allopen', (req, res) => {
    let sendData = {};
    let i = 0
    db.getOpenedFromDB().then(async (data) => {
        const symbols = [];
        data.forEach((element) => {symbols.push(element.symbol)
        sendData[element.symbol] = {openprice: element.openprice}
        });
        await Promise.all(symbols.map(async (symbol) => {
            sendData[symbol].currentprice = await (current.getCurrentSpot(symbol));

        }));

        res.send(sendData);
    });


});



module.exports = router;
