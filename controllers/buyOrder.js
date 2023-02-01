const express = require('express');
const router = express.Router();
const {Order} = require('../helpers/buyandsell');

router.post('/:symbol/:qty', (req, res) => {

    Order(req.params.symbol, req.params.qty, 'BUY').then((data) => {
        res.send(data);
    });
});

module.exports = router;
