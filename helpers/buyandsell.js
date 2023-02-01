const Binance = require("binance-api-node").default;
const config = require('config')


const apiKey = config.get('apiKey')
const apiSecret = config.get('apiSecret')

const client = Binance({
    apiKey : apiKey,
    apiSecret : apiSecret
});

let buy = ['TUSDT','XTZUSDT'];
let sell =['TUSDT','XTZUSDT'];
let data ={};
let orderHistory = {};



function getBalance(symbol){

    return new Promise((resolve, reject) => {
        try {
            client.accountInfo().then((data) => {
                if(symbol != ''){
                    for(const spot of data["balances"]){
                        if(spot['asset'] == symbol){
                            resolve(spot)
                        }

                    }
                }

                if(symbol == ''){
                    resolve(data["balances"]);
                }
            });
        }
        catch (e){
            resolve(e);
            console.log(e);
        }

    });
}

function getAccount(){
    return new Promise((resolve, reject) => {
    client.accountInfo().then((accountInfo) => {

            for(const spot of accountInfo["balances"]){
                if(Number(spot['free'])>0 ){

                    data[spot['asset']] = spot;

                }

            }
        resolve(data);
        });

    });
}


function Order(symbol, quantity, side){
    return new Promise((resolve, reject) => {
        try{

            client
                .exchangeInfo()
                .then(info => {
                    let data = info.symbols.find(symbols => symbols.symbol == symbol).filters[1].minQty;
                    let indexDot = data.indexOf('.');
                    let _minqty = (data.substring(indexDot+1)).indexOf('1') + 1;

                    let _quantity = quantity.toString().slice(0,quantity.toString().indexOf('.')+1+_minqty);
                    _quantity = _quantity+'0';
                    return client.order({
                        symbol: symbol,
                        side: side,
                        type: 'MARKET',
                        quantity: (_quantity)
                    });
                }).then(response => {
                console.log(response);
                resolve(response);

            })
                .catch(error => {
                    console.log(error);
                });


        }
        catch (e){
            resolve(e);
            console.log(e);
        }
    });

}



function newSellOrder(symbol){
    return new Promise((resolve, reject) => {
        try{
            client
                .accountInfo()
                .then(accountInfo => {
                    const quantity = accountInfo.balances.find(balances => balances.asset === symbol).free;
                    return client.order({
                        symbol: symbol+"USDT",
                        side: 'SELL',
                        type: 'MARKET',
                        quantity: quantity
                    });
                })
                .then(response => {
                    console.log(response);
                    resolve(response);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        catch (e){
            resolve(e);
            console.log(e);
        }
    });

}
function buyOrder(symbol, quantity){
    return new Promise((resolve, reject) => {
        try{
            client.order({
                symbol: symbol,
                side: 'BUY',
                quantity: quantity,
                type: 'MARKET',

            }).then((data) => {
                resolve(data);
                buy.push(symbol);
            })
        }
        catch (e){
            resolve(e);
            console.log(e);
        }

    });
}

function getHistory(symbol){
    return new Promise((resolve, reject) => {

        try{
            getAccount().then((data) => {
                for(const spot of Object.keys(data)){
                    if(spot != 'USDT'){
                        isOk = false;
                    client.myTrades({symbol:spot+"USDT", limit: 5}).then((data) => {
                        for(let i = 0; i< data.length; i++){
                            data[i].time = (new Date(data[i].time)).toLocaleString();
                            if(i == data.length-1){
                                isOk = true;
                            }
                        };
                        orderHistory[spot] = data;
                        return orderHistory;
                    }).then((data1) => {
                        if(isOk )
                        resolve(data1);
                    });

                    }
                }

            })

        }
        catch (e){

            console.log(e);
        }



    });
}



module.exports ={

    Order,
    buyOrder,
    getHistory,
    newSellOrder,
    getAccount,
    getBalance
}



