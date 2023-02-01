const WebSocket = require('ws');
const BINANCE_API_URL = 'wss://stream.binance.com:9443/ws';
const getAll = require('../helpers/getAllPairs');
const insertData = require('../db/dbinsert');
const sellOrBuy = require('../helpers/buyandsell');
const db = require('../db/db');
const dbInsert = require('../db/dbinsert');
const dbUpdate = require('../db/dbUpdate');
const current = require('../helpers/getCurrentPrice');
const tv = require('../helpers/tradingView');
const buySell = require('../helpers/buyandsell');

let lastData ={};
let lastDataCache = {};
let last24hr = {};
let openTask ={};
let taskid
let show = true;
let isBuyorSell = true;

function isbuyorsell(){
    isBuyorSell = !isBuyorSell;
    return isBuyorSell;
}

function changeShow(){
    show = !show;
    return show;
}

console.log("Starting Binance Websocket");
getTaskId();
getLast24hr();
function getTaskId(){
    db.getSpotLatestId().then((data) => {
        taskid = data;
        console.log("SPOT TASK ID: " +taskid);
    }).catch((err) => {
        taskid = 0;
        console.log(err);
    });
};
function getLast24hr() {
    getAll.getAllTradingPairs().then((data) => {
        const tradingPairs = data;

        for (const pair of tradingPairs) {

            last24hr[pair.symbol] = {"volDolar":Number(pair.quoteVolume),"vol": Number(pair.volume), "lastPrice": Number(pair.lastPrice), "open": new Date(pair.openTime).toLocaleString(), "close": new Date(pair.closeTime).toLocaleString(), "high": Number(pair.highPrice), "low": Number(pair.lowPrice)};

        }

    }).catch((err) => {
        console.log(err);
    });

};
function coin(open, close, totalsell, totalbuy, totalvol,high,low,price){
    this._open = open;
    this._close = close;
    this._totalsell = totalsell;
    this._totalbuy = totalbuy;
    this._totalvol = totalvol;
    this._high = high;
    this._low = low;
    this._price = price;
}
function getOpenedTask(){
db.getOpenedFromDB().then((data)=>{
    console.log(data);
    for(const task of data){
         openTask[task.symbol] = {"id": task.id,"price": task.openprice, "openTime": task.open, "type": task.sellorbuy, "status" : "true", "closeTime":"", "closePrice":"", "quantity": task.quantity };

    }
})

}
function subscribeToTicker(symbol){

    const ws = new WebSocket(`${BINANCE_API_URL}/${symbol.toLowerCase()}@kline_1m`);
    lastDataCache[symbol] = {0:''};
    let i = 0;
    let counter = 0;

    ws.on('message', data => {
        const tickerData = JSON.parse(data);

        const dateOpen = new Date(tickerData.k["t"]).toLocaleTimeString();
        const dataClose = new Date(tickerData.k["T"]).toLocaleTimeString();
        const totalVol = Number(tickerData.k["v"]);
        const totalBuy = Number(tickerData.k["V"]);
        const totalSell = totalVol - totalBuy;
        if(lastData[symbol] != undefined) {
            if (lastData[symbol]["_open"] != dateOpen) {
                //insertData.insertDataSpot(symbol, lastData[symbol]["_open"], lastData[symbol]["_close"], lastData[symbol]["_totalsell"], lastData[symbol]["_totalbuy"], lastData[symbol]["_totalvol"], lastData[symbol]["_high"], lastData[symbol]["_low"]);
                if(symbol == "BTCUSDT" && show){

                //mevcut emirleri getir
                    console.log("BTCUSDT: " +lastData[symbol]["_low"] + " last min sell: " + lastData[symbol]["_totalsell"] + " last min buy: " + lastData[symbol]["_totalbuy"] + " last min vol: " + lastData[symbol]["_totalvol"] );

                }

            lastDataCache[symbol][i] = lastData[symbol];
            counter++;
            i++;
            let totalSell5 = 0;
            let totalBuy5 = 0;
            let totalVol5 =0;
            if(i == 6) {
                lastDataCache[symbol][0] = lastDataCache[symbol][1];
                lastDataCache[symbol][1] = lastDataCache[symbol][2];
                lastDataCache[symbol][2] = lastDataCache[symbol][3];
                lastDataCache[symbol][3] = lastDataCache[symbol][4];
                lastDataCache[symbol][4] = lastDataCache[symbol][5];

                totalSell5 = lastDataCache[symbol][0]["_totalsell"] + lastDataCache[symbol][1]["_totalsell"] + lastDataCache[symbol][2]["_totalsell"] + lastDataCache[symbol][3]["_totalsell"] + lastDataCache[symbol][4]["_totalsell"];
                totalBuy5 = lastDataCache[symbol][0]["_totalbuy"] + lastDataCache[symbol][1]["_totalbuy"] + lastDataCache[symbol][2]["_totalbuy"] + lastDataCache[symbol][3]["_totalbuy"] + lastDataCache[symbol][4]["_totalbuy"];
                totalVol5 = lastDataCache[symbol][0]["_totalvol"] + lastDataCache[symbol][1]["_totalvol"] + lastDataCache[symbol][2]["_totalvol"] + lastDataCache[symbol][3]["_totalvol"] + lastDataCache[symbol][4]["_totalvol"];
                i =5;

            }

            let sell=0, buy=0, neutral=0;
            if((lastData[symbol]["_totalsell"]*3 < lastData[symbol]["_totalbuy"]) && (last24hr[symbol]["volDolar"] > 3000000) && (lastData[symbol]["_totalvol"] > last24hr[symbol]["vol"] * 0.01)
                && (lastData[symbol]["_totalsell"] > 0 )&& (lastData[symbol]["_totalbuy"] > 0)){

                if(symbol in openTask){
                    //console.log("Already in openTask");
                }
                else{
                    console.log(symbol+ " sell vol: "+lastData[symbol]["_totalsell"]+" buy vol:"+lastData[symbol]["_totalbuy"]+ " Last 1 Min Volume: " + lastData[symbol]["_totalvol"] + " Last 24hr Volume: " + last24hr[symbol]["vol"] + " Last 24hr Dollar: " +last24hr[symbol]["volDolar"]);

                    current.getCurrentSpot(symbol).then( (data) =>  {
                        tv(symbol).then((data1)=>{
                            for(let a in data1.summary){
                                sell += Number(data1.summary[a].sell);
                                buy += Number(data1.summary[a].buy);
                                neutral += Number(data1.summary[a].neutral);
                            }
                            console.log(symbol+ " price: "+data+ " sell: " + sell + " buy: " + buy + " neutral: " + neutral);

                            if((sell*2 < buy && buy > neutral*0.75) || (buy > sell*10) ){
                                buySell.Order(symbol, (15/data), 'BUY' ).then((data2) => {
                                    openTask[symbol] = {"id": taskid,"price": data, "openTime": new Date().toLocaleString(), "type": "buy", "status" : "true", "closeTime":"", "closePrice":"", "quantity": (15/data) };
                                    dbInsert.insertTask("spot",taskid,symbol,openTask[symbol]["openTime"],"",openTask[symbol]["price"], "","buy","open", lastData[symbol]["_totalbuy"], lastData[symbol]["_totalsell"], totalVol5, totalSell5, totalBuy5, (15/data));
                                    console.log("spot id: "+taskid+" Opened Task buy: "+symbol+ " price: "+openTask[symbol]["price"]+ " sell vol: "+lastData[symbol]["_totalsell"]+" buy vol:"+lastData[symbol]["_totalbuy"]+ " Last 1 Min Volume: " + lastData[symbol]["_totalvol"] + " Last 24hr Volume: " + last24hr[symbol]["vol"]);
                                    //console.log(symbol);
                                    //console.log(data1);
                                    taskid++;
                                });

                            }


                        });
                    });


                }


            }
        }
        }


        lastData[symbol] = new coin(dateOpen, dataClose, totalSell, totalBuy, totalVol, tickerData.k["h"], tickerData.k["l"], tickerData.k["c"]);

        if(symbol in openTask){
            if(lastData[symbol]["_price"] > (openTask[symbol]["price"])*1.1) {
                let sell1=0, buy1=0, neutral1=0;
                tv(symbol).then((data1)=>{
                    if(symbol in openTask){
                        for(let a in data1.summary){
                            sell1 += Number(data1.summary[a].sell);
                            buy1 += Number(data1.summary[a].buy);
                            neutral1 += Number(data1.summary[a].neutral);
                        }

                        if(sell1*2 < buy1 && buy1 > neutral1*0.8){
                            console.log(symbol + "%10 arttı ama devam ediyor." + " sell: " + sell1 + " buy: " + buy1 + " neutral: " + neutral1);
                        }

                        else{
                            console.log(symbol + "%10 arttı ama durduruldu." + " sell: " + sell1 + " buy: " + buy1 + " neutral: " + neutral1);
                            buySell.getBalance(symbol.slice(0,-4)).then((data) => {
                                if(data["free"] > 0){
                                    buySell.Order(symbol, (data["free"]), 'SELL').then((sellData) => {
                                        openTask[symbol]["status"] = "false";
                                        openTask[symbol]["closeTime"] = new Date().toLocaleString();
                                        openTask[symbol]["closePrice"] = lastData[symbol]["_high"];
                                        dbUpdate("spot",openTask[symbol]["id"],openTask[symbol]["closeTime"],openTask[symbol]["closePrice"],"closed")
                                        console.log("spot Closed Task: "+symbol+ " Open Time: " + openTask[symbol]["openTime"] + " Close Time: " + openTask[symbol]["closeTime"] + " Open Price: " + openTask[symbol]["price"] + " Close Price: " + openTask[symbol]["closePrice"]);
                                        //db.insertTask("spot",symbol,openTask[symbol]["price"], "" ,openTask[symbol]["closeTime"],openTask[symbol]["closePrice"],"buy","closed" )
                                        delete openTask[symbol];
                                    });
                                }
                            });



                        }

                    }});

            }

            else if(lastData[symbol]["_high"] < (openTask[symbol]["price"])*0.9){
                let sell2=0, buy2=0, neutral2=0;
                tv(symbol).then((data1)=>{
                    if(symbol in openTask){
                        for(let a in data1.summary){
                            sell2 += Number(data1.summary[a].sell);
                            buy2 += Number(data1.summary[a].buy);
                            neutral2 += Number(data1.summary[a].neutral);
                        }
                        if(sell2*2 < buy2 && buy2 > neutral2*0.8){
                            console.log(symbol + "%10 düştü ama devam ediyor." + " sell: " + sell2 + " buy: " + buy2 + " neutral: " + neutral2);
                        }

                        else{
                            console.log(symbol+ " Sell:" + sell2 + " Buy:" + buy2 + " Neutral:" + neutral2 + " %10 düştü ve kapatıldı.");
                            buySell.getBalance(symbol.slice(0,-4)).then((data) => {
                                if(data["free"] > 0){
                                    buySell.Order(symbol, (data["free"]), 'SELL').then((sellData) => {
                                        openTask[symbol]["status"] = "false";
                                        openTask[symbol]["closeTime"] = new Date().toLocaleString();
                                        openTask[symbol]["closePrice"] = lastData[symbol]["_high"];
                                        dbUpdate("spot",openTask[symbol]["id"],openTask[symbol]["closeTime"],openTask[symbol]["closePrice"],"closed")
                                        console.log("spot Closed Task: "+symbol+ " Open Time: " + openTask[symbol]["openTime"] + " Close Time: " + openTask[symbol]["closeTime"] + " Open Price: " + openTask[symbol]["price"] + " Close Price: " + openTask[symbol]["closePrice"]);
                                        //db.insertTask("spot",symbol,openTask[symbol]["price"], "" ,openTask[symbol]["closeTime"],openTask[symbol]["closePrice"],"buy","closed" )
                                        delete openTask[symbol];
                                    });
                                }
                            });

                        }

                    }});
                //console.log("spot buy : " + symbol +" current price: " + lastData[symbol]["_low"] + " open price: " + openTask[symbol]["price"] + " waiting:" +(openTask[symbol]["price"])*1.05+" last min sell: " +lastData[symbol]["_totalsell"]+ "last min buy: " +lastData[symbol]["_totalbuy"]  );
            }

        }
    });
}

function openedTask(){
    return openTask;
}

module.exports = {
    subscribeToTicker,
    changeShow,
    isbuyorsell,
    openedTask,
    getOpenedTask
}

