require("dotenv").config();
const MongoDB        = require('mongodb');
const MongoClient    = MongoDB.MongoClient;
const dbPath         = process.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb://localhost:27017/tamuhack";

var _db;

module.exports = {
    connectToDb: connectToDb,
    getDb: getDb
};

function setup() {
    // Perform any DB setup functions here
    let promises = [];
    let passengerPromise = new Promise(function(resolve, reject) {
        _db.collection("passenger").createIndex({"email": 1}, {"unique": true}, function(err, response) {
            if (err) {
                reject();
                console.log(err);
                return;
            }
            resolve();
        });
    });
    promises.push(passengerPromise);

    let flightsPromise = new Promise(function(resolve, reject) {
        _db.collection("flight").createIndex({"flightNumber": 1, "departureTime": 1}, {"unique": true}, function(err, response) {
            if (err) {
                reject();
                console.log(err);
                return;
            }
            resolve();
        });
    });
    promises.push(flightsPromise);

    let reservationsPromise = new Promise(function(resolve, reject) {
        _db.collection("reservation").createIndex({"recordLocator": 1}, {"unique": true}, function(err, response) {
            if (err) {
                reject();
                console.log(err);
                return;
            }
            resolve();
        });
    });
    promises.push(reservationsPromise);

    return Promise.all(promises);
}

function connectToDb(callback) {
    console.log("Connecting to MongoDB @ ", dbPath);
    let dbPromise = new Promise(function(resolve, reject) {
        MongoClient.connect(dbPath, function(err, dbConnection) {
            if (err) reject(err);
            _db = dbConnection;
            console.log("Connected to DB");
            setup().then(function(){
                resolve();
            });
        });
    });
    return dbPromise;
}

function getDb() {
    return _db;
}
