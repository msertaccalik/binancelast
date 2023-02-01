const express = require('express');
const router = express.Router();
const binancews = require('../socket/binancews')



router.post('/',(req,res)=>{
    let show = binancews.changeShow();
    res.send(show);

})


router.post('/buyorsell',(req,res)=>{
    let buyorsell = binancews.isbuyorsell();
    res.send(buyorsell);

});

module.exports=router;
