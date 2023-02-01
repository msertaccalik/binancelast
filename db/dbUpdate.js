const pg = require('pg');
const db = require('./db');
const config = require('config')


const connection = config.get('defaultDB')
const postgresClient = new pg.Pool(connection);





function updateTask(taskType, id, close,closeprice,  status){
    return new Promise((resolve, reject) => {
        if(taskType == "futures"){
            let tableName = "aafuturestask"
            let query = 'UPDATE "futuresSchema".' + tableName.toLowerCase() + ' SET close = \''+close+'\' , closeprice = \''+closeprice+'\' , status = \''+status+'\' WHERE id = \''+id+'\'';
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
            let query = 'UPDATE "spotSchema".' + tableName.toLowerCase() + ' SET close = \''+close+'\' , closeprice = \''+closeprice+'\' , status = \''+status+'\' WHERE id = \''+id+'\'';
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

module.exports = updateTask;
