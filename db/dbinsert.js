const pg = require('pg');
const db = require('./db');
const config = require('config')


const connection = config.get('defaultDB')
const postgresClient = new pg.Pool(connection);

function insertDataSpot(tablename, open, close, totalsell, totalbuy, totalvol,high,low){
    let counter = 1;

    return new Promise((resolve, reject) => {

            let query = 'INSERT INTO "spotSchema".' + tablename.toLowerCase() + '(open, close, highprice, lowprice, totalsell, totalbuy, totalvol, time) VALUES (\'' +open  + '\',\''+ close + '\',\''+ high + '\',\''+ low + '\',\''+ totalsell + '\',\''+ totalbuy + '\',\''+ totalvol + '\', now())';
            postgresClient.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log(query);
                    //resolve(err);
                } else {
                   //resolve("ADDED " + tablename + " DATA");

                }
                    });

    });
}

function insertDataFutures(tablename, open, close, totalsell, totalbuy, totalvol,high,low){
    let counter = 1;

    return new Promise((resolve, reject) => {

        let query = 'INSERT INTO "futuresSchema".' + tablename.toLowerCase() + '(open, close, highprice, lowprice, totalsell, totalbuy, totalvol, time) VALUES (\'' +open  + '\',\''+ close + '\',\''+ high + '\',\''+ low + '\',\''+ totalsell + '\',\''+ totalbuy + '\',\''+ totalvol + '\', now() )';
        postgresClient.query(query, (err, result) => {
            if (err) {
                console.log(err);
                console.log(query);
                //resolve(err);
            } else {
                //resolve("ADDED " + tablename + " DATA");

            }
        });

    });
}

function insertTask(taskType,id,symbol,open, close, price,closeprice, sellorbuy, status,lastfiveminbuy,lastfiveminsell,lastfiveminvol,lastsell,lastbuy, quantity){
    return new Promise((resolve, reject) => {
    if(taskType == "futures"){
        let tableName = "aafuturestask"
        let query = 'INSERT INTO "futuresSchema".' + tableName.toLowerCase() + '(id,open, symbol, close,openprice, closeprice,  sellorbuy, status, lastfiveminbuy, lastfiveminsell, lastfiveminvol, lastminbuy, lastminsell) VALUES ' +
            '(\'' +id  + '\',\'' +open  + '\',\'' +symbol  + '\',\''+ close + '\',\''+ price + '\',\''+ closeprice + '\',\''+ sellorbuy + '\',\''+ status + '\', \''+lastfiveminbuy+'\', \''+lastfiveminsell+'\', \''+lastfiveminvol+'\', \''+lastbuy+'\', \''+lastsell+'\',\''+ quantity + '\')';
        postgresClient.query(query, (err, result) => {
            if (err) {
                console.log(err);
                console.log(query);
                //resolve(err);
            } else {
                //resolve("ADDED " + tablename + " DATA");

            }
        });

    }

    else if(taskType == "spot"){
        let tableName = "aaspottask"
        let query = 'INSERT INTO "spotSchema".'  + tableName.toLowerCase() + '(id, open, symbol, close,  openprice, closeprice, sellorbuy, status, lastfiveminbuy, lastfiveminsell, lastfiveminvol, lastminbuy, lastminsell, quantity) VALUES ' +
            '(\'' +id  + '\',\'' +open  + '\',\'' +symbol  + '\',\''+ close + '\',\''+ price + '\',\''+ closeprice + '\',\''+ sellorbuy + '\',\''+ status + '\', \''+lastfiveminbuy+'\', \''+lastfiveminsell+'\', \''+lastfiveminvol+'\', \''+lastbuy+'\', \''+lastsell+'\', \''+quantity+'\' )';
        postgresClient.query(query, (err, result) => {
            if (err) {
                console.log(err);
                console.log(query);
                //resolve(err);
            } else {
                //resolve("ADDED " + tablename + " DATA");

            }
        });
    }

    });
}


module.exports = {
    insertDataSpot,
    insertTask,
    insertDataFutures
};
