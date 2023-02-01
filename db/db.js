const pg = require('pg');
const config = require('config')


const connection = config.get('defaultDB')

const postgresClient = new pg.Pool({
    user: connection.user,
    host: connection.host,
    database: connection.database,
    password: connection.password,
    port: connection.port,
});


function createTableSpot(tableName){
    postgresClient.query(`
    CREATE TABLE IF NOT EXISTS "spotSchema".`+tableName+` (
	    "id" SERIAL,
	    "open" VARCHAR(100) NOT NULL,
	    "close" VARCHAR(100) NOT NULL,
	    "highprice" VARCHAR(50) NOT NULL,
	    "lowprice" VARCHAR(50) NOT NULL,
	    "totalsell" VARCHAR(50) NOT NULL,
	    "totalbuy" VARCHAR(50) NOT NULL,
	    "totalvol" VARCHAR(50) NOT NULL,
	    "time" VARCHAR(50) NOT NULL,
	    
	    PRIMARY KEY ("id")
    );`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Spot table created: " + tableName);
        }
    });
}

function createTableFutures(tableName){

    postgresClient.query(`
    CREATE TABLE IF NOT EXISTS "futuresSchema".`+tableName+` (
	    "id" SERIAL,
	    "open" VARCHAR(100) NOT NULL,
	    "close" VARCHAR(100) NOT NULL,
	    "highprice" VARCHAR(50) NOT NULL,
	    "lowprice" VARCHAR(50) NOT NULL,
	    "totalsell" VARCHAR(50) NOT NULL,
	    "totalbuy" VARCHAR(50) NOT NULL,
	    "totalvol" VARCHAR(50) NOT NULL,
	    "time" VARCHAR(50) NOT NULL,
	    PRIMARY KEY ("id")
    );`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Futures table created: " + tableName);
        }
    });
}

function createTaskFutures(){
    let tableName = "aafuturestask"
    postgresClient.query(`
    CREATE TABLE IF NOT EXISTS "futuresSchema".`+tableName+` (
	    "id" integer NOT NULL,
	    "symbol" VARCHAR(100) NOT NULL,
	    "open" VARCHAR(100) NOT NULL,
	    "close" VARCHAR(100) NOT NULL,
	    "openprice" VARCHAR(50) NOT NULL,
	    "closeprice" VARCHAR(50) NOT NULL,
	    "sellorbuy" VARCHAR(50) NOT NULL,
	    "status" VARCHAR(50) NOT NULL,
	    "lastfiveminbuy" VARCHAR(50) NOT NULL,
	    "lastfiveminsell" VARCHAR(50) NOT NULL,
	    "lastfiveminvol" VARCHAR(50) NOT NULL,
	    "lastminbuy" VARCHAR(50) NOT NULL,
	    "lastminsell" VARCHAR(50) NOT NULL,
	    
	    PRIMARY KEY ("id")
    );`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Spot table created: " + tableName);
        }
    });
}

function createTaskSpot(){
    let tableName = "aaspottask"
    postgresClient.query(`
    CREATE TABLE IF NOT EXISTS "spotSchema".`+tableName+` (
	    "id" integer NOT NULL,
	    "symbol" VARCHAR(100) NOT NULL,
	    "open" VARCHAR(100) NOT NULL,
	    "close" VARCHAR(100) NOT NULL,
	    "openprice" VARCHAR(50) NOT NULL,
	    "closeprice" VARCHAR(50) NOT NULL,
	    "sellorbuy" VARCHAR(50) NOT NULL,
	    "status" VARCHAR(50) NOT NULL,
	    "lastfiveminbuy" VARCHAR(50) NOT NULL,
	    "lastfiveminsell" VARCHAR(50) NOT NULL,
	    "lastfiveminvol" VARCHAR(50) NOT NULL,
	    "lastminbuy" VARCHAR(50) NOT NULL,
	    "lastminsell" VARCHAR(50) NOT NULL,
	    "quantity" VARCHAR(50) NOT NULL,
	    
	    PRIMARY KEY ("id")
    );`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Spot table created: " + tableName);
        }
    });
}

function getSpotLatestId(){
    return new Promise((resolve, reject) => {
        try{
            postgresClient.query(`SELECT id FROM "spotSchema"."aaspottask" ORDER BY id DESC LIMIT 1`, (err, result) => {
                if (result.rows.length == 0) {
                    reject("error");
                } else {
                    resolve(result.rows[0].id)
                }
            });
        }
        catch(e){
            console.log(e)
        }

    })
}

function getOpenedFromDB(){
    return new Promise((resolve, reject) => {
        postgresClient.query(`SELECT * FROM "spotSchema"."aaspottask" WHERE status='open' ORDER BY id DESC`, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                resolve(result.rows)
            }
        });
    })
}

function getAllFromDB(){
    return new Promise((resolve, reject) => {
        postgresClient.query(`SELECT * FROM "spotSchema"."aaspottask" ORDER BY id DESC`, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                resolve(result.rows)
            }
        });
    })
}

function getFuturesLatestId(){
    return new Promise((resolve, reject) => {
        postgresClient.query(`SELECT id FROM "futuresSchema"."aafuturestask" ORDER BY id DESC LIMIT 1`, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                resolve(result.rows[0].id)
            }
        });
    })
}




module.exports = {
    createTableSpot,
    createTableFutures,
    createTaskFutures,
    createTaskSpot,
    getSpotLatestId,
    getFuturesLatestId,
    getOpenedFromDB,
    getAllFromDB
}
