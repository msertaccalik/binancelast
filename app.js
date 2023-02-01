const checkData = require('./socket/binancews');
//const checkDataFuture = require('./socket/binancewsfutures');
const getAll = require('./helpers/getAllPairs');
const request = require('request');
const db = require('./db/db');
const express = require('express');
const app = express();
const changeController = require('./controllers/changeShow');
const getBalanceController = require('./controllers/getBalance');
const getOrderHistoryController = require('./controllers/getOrderHistory');
const buyOrder = require('./controllers/buyOrder');
const sellOrder = require('./controllers/sellOrder');
const getOpenTask = require('./controllers/getOpenTask');
const fs = require("fs");
const util = require("util");
const port = 3000;
app.use(express.json());
app.listen(port, () => console.log(`listening on port ${port}!`));
const BINANCE_API_URL = 'https://api.binance.com';

const BINANCE_FUTURE_API_URL = 'https://fapi.binance.com';

app.use('/api/changeShow', changeController);
app.use('/api/getBalance', getBalanceController);
app.use('/api/getOrderHistory', getOrderHistoryController)
app.use('/api/sellOrder', sellOrder);
app.use('/api/buyOrder', buyOrder);
app.use('/api/getOpenTask',getOpenTask);
console.log("running");



async function checkHighActivity() {
    try {
        await db.createTaskSpot();
        await db.createTaskFutures();

        // Get the list of all trading pairs
        const tradingPairs = await getAll.getAllTradingPairs();
        const tradingFuturePairs = await getAll.getAllFuturePairs();

        // Iterate over each trading pair and get the 24-hour price change
        for (const pair of tradingPairs) {
            if(pair.symbol.slice(-4) == 'USDT' && pair.symbol.slice (-6,-4) != 'UP' && pair.symbol.slice(-8,-4) != 'DOWN' && pair.symbol.slice(0,1) != '1' && pair.symbol.slice(0,3) != 'GBP' && pair.symbol.slice(0,3) != 'EUR' ){
                db.createTableSpot(pair.symbol);
                checkData.subscribeToTicker(pair.symbol);
                console.log("socket created for "+pair.symbol);
                // Check if the price has increased or decreased significantly (more than 5%) in the past 24 hours
                /*if (pair.priceChangePercent > 5) {
                    console.log(`High buy activity for ${pair.symbol}: price has increased by ${pair.priceChangePercent}% in the past 24 hours.`);
                } else if (pair.priceChangePercent < -5) {
                    console.log(`High sell activity for ${pair.symbol}: price has decreased by ${pair.priceChangePercent}% in the past 24 hours.`);
                }
                else{
                    console.log(`No high activity for ${pair.symbol}   ${pair.priceChangePercent}% in the past 24 hours.`);
                }*/
            }

        }

        for (const futures of tradingFuturePairs){
            if(futures.symbol.slice(0,1) != '1' && futures.symbol.slice(-4) == 'USDT'){

                db.createTableFutures(futures.symbol);
                //checkDataFuture.subscribeToTicker(futures.symbol);
                //checkData.subscribeToTicker(pair.symbol);
                //console.log("socket created for "+pair.symbol);
            }

        }
        await checkData.getOpenedTask();
    } catch (error) {
        console.error(error);
    }
}

//checkData.doldur();
let logFile = fs.createWriteStream('apiService.log', {
    flags: 'a'
});
let logStdout = process.stdout;
console.log = function() {
    logFile.write(new Date().toLocaleString() + ' ' + util.format.apply(null, arguments) + '\n');
    logStdout.write(new Date().toLocaleString() + ' ' + util.format.apply(null, arguments) + '\n');
};

checkHighActivity();
