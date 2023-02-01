const request = require('request');

const BINANCE_API_URL = 'https://api.binance.com';

const BINANCE_FUTURE_API_URL = 'https://fapi.binance.com';



function getAllFuturePairs(){
    return new Promise((resolve, reject) => {
        request.get(`${BINANCE_FUTURE_API_URL}/fapi/v1/ticker/24hr`, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                const data = JSON.parse(body);
                resolve(data);
            }
        });
    });
}


function getAllTradingPairs() {
    return new Promise((resolve, reject) => {
        request.get(`${BINANCE_API_URL}/api/v3/ticker/24hr`, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                const data = JSON.parse(body);
                resolve(data);
            }
        });
    });
}

module.exports = {
    getAllTradingPairs,
    getAllFuturePairs
}
