const express = require('express');
const router = express.Router();
const {getHistory} = require('../helpers/buyandsell');

router.get('/', (req, res) => {

        getHistory().then((data) => {
            res.send(data);
        });
});


module.exports = router;
