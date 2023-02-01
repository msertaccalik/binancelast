const request = require('request');

const BINANCE_API_URL = 'https://api.binance.com';

const BINANCE_FUTURE_API_URL = 'https://fapi.binance.com';


function getCurrentFutures(symbol){
    return new Promise((resolve, reject) => {
        request.get(`${BINANCE_FUTURE_API_URL}/fapi/v1/ticker/24hr?symbol=${symbol}`, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                const data = JSON.parse(body);
                resolve(data);
            }
        });
    });
}


function getCurrentSpot(symbol) {
    return new Promise((resolve, reject) => {
        request.get(`${BINANCE_API_URL}/api/v3/ticker/price?symbol=${symbol}`, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                const data = JSON.parse(body);
                resolve(data.price);
            }
        });
    });
}

module.exports = {
    getCurrentSpot,
    getCurrentFutures
}
