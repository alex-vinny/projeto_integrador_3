const mysql = require('mysql');
const config = require('./config');

const runQuery = function(sql, values, getResult) {
    const connection = mysql.createConnection({
        host: config.Host,
        port: config.Port,
        user: config.User,
        password: config.Pass,
        database: config.Database
    });

    connection.connect(function(err) {
        if (err) {
            console.error('Erro na tentativa de conexão: ' + err);
            getResult(undefined);
            return;
        }
    
        console.log('Conectado com sucesso com id ' + connection.threadId);

        connection.query(sql, [values], function(err, results) {
            console.log("SQL>>", sql, [values]);
            if (err) console.log('Erro ao executar a consulta:', err, sql, values);
    
            connection.end();

            if (getResult) {
                results = JSON.parse(JSON.stringify(results))
                console.log('Resultado da query:', results);

                getResult(results);
            }
        });
    });
};

function getValidToken(getValue) {
    const sql = "SELECT token FROM `auth` WHERE expiration > now() LIMIT 1;"
    runQuery(sql,'', function(result) {

        let generatedToken = undefined;
        if (result) {
            generatedToken = result[0];
        }
        console.log("auth::getValidToken", generatedToken);
        getValue((generatedToken ? generatedToken.token : generatedToken));
    });    
}
      
function insertValidToken(getValue) {
    const sql = "UPDATE `auth` SET expiration=date_add(current_timestamp(), interval -1 DAY) WHERE expiration > now();";
     runQuery(sql, '', (sucess) => {
        runQuery("INSERT INTO `auth`(expiration) SELECT now();", '', (sucess) => {
            runQuery("SELECT token FROM `auth` WHERE expiration > now() LIMIT 1;", '', function(result) {
                console.log("auth::insertValidToken", result);
                getValue(result);
            });
        });
    });
}

function getApp(getValue) {
    const sql = "SELECT code FROM `app` WHERE code = ? LIMIT 1;"
    const configId = config.AppId;

    runQuery(sql, configId, function(result) {
        console.log("auth::getApp", result);

        let appId = undefined;

        if (result) {
            appId = result[0].code;
            console.log('getappId', appId);

            getValue(appId);
        }
    });
}

function getCurrentGarden(getValue) {
    const sql = "SELECT status, description FROM `garden` WHERE app_id IN (SELECT id from `app` WHERE code = ?) LIMIT 1;"
    const configId = config.AppId;

    runQuery(sql, configId, function(result) {
        console.log("garden::current", result);        
        let garden = undefined;

        if (result && result.length > 0) {
            garden = {};
            garden.status = result[0].status;
            garden.description = result[0].description;
            console.log('getCurrentGarden', garden);
        }

        getValue(garden);
    });
}

function insertNewGarden(payload, data, getValue) {
    const configId = config.AppId;
    const sql = "INSERT INTO `historic`(`payload`) VALUES (?);";

    runQuery(sql, payload, (sucess) => {

        runQuery("SELECT id from `app` WHERE code = ?", configId, function(ret) {       

            const insertQuery = "\
                INSERT INTO `garden`(`status`, `description`, `app_id`)\
                SELECT ?\
                WHERE NOT EXISTS (\
                    SELECT 1 FROM `garden`\
                ) LIMIT 1;";
            runQuery(insertQuery, [data.status, data.description, ret[0].id], (sucess) => {
                
                const status = data.status;
                const description = data.description;

                const updateQuery = "UPDATE `garden` SET ? WHERE 1=1;";
                runQuery(updateQuery, {status, description}, function(result) {
                    console.log("garden::insertNew", result);
                    getValue(data);
                });
            });
        });
    });
}

module.exports.validToken = getValidToken;
module.exports.getAppId = getApp;
module.exports.generateToken = insertValidToken;
module.exports.gardenCurrent = getCurrentGarden;
module.exports.gardenInsert = insertNewGarden;