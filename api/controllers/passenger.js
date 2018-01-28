'use strict';
const _                 = require('lodash');
const mongo             = require('mongodb');
const mongoHelper       = require('../helpers/mongoHelper');
const randomstring      = require('randomstring');
const emailValidator    = require('email-validator');

module.exports = {
    passenger: passenger,
    createPassenger: createPassenger,
    retrievePassenger: retrievePassenger
};

function passenger(req, res) {
    var email = _.toLower(req.swagger.params.email.value);
    console.log("Looking for passenger: ", email);
    let passengers = mongoHelper.getDb().collection("passenger");
    try {
        passengers.findOne({"email": email}, function(err, record) {
            if (err || record == null) {
                res.status(400).json({"error": "Passenger could not be found"});
                console.log(err);
                return;
            };
            res.json(record);
        });
    } catch(err) {
        res.status(400).json({"error": "Something went wrong looking for passenger"});
    }
};

function createPassenger(req, res) {
    var record = {};
    record.firstName = _.get(req, "swagger.params.firstName.value");
    record.lastName = _.get(req, "swagger.params.lastName.value");
    record.gender = _.get(req, "swagger.params.gender.value");
    record.email = _.toLower(_.get(req, "swagger.params.email.value"));
    record.aadvantageId = _.get(req, "swagger.params.aadvantageNumber.value");

    if (!emailValidator.validate(record.email)) {
        res.status(400).json({"error": "Invalid email address"});
        return;
    }

    if(record.firstName && record.lastName && record.gender && record.email) {
        if (!record.aadvantageId) {
            record.aadvantageId = createAadvantageId();
        }

        let passengers = mongoHelper.getDb().collection("passenger");
        try {
            passengers.insertOne(record, function(err, response) {
                let passenger = _.get(response, "ops[0]");
                if (err || !passenger) {
                    res.status(400).json({"error": "Passenger could not be created", "reason": err});
                    console.log(err);
                    return;
                };
                res.json(passenger);
            });
        } catch(err) {
            res.status(400).json({"error": "Something went wrong creating passenger"});
        }
    } else {
        res.status(400).json({"error": "Passenger could not be created; required fields missing"});
    }
}

function retrievePassenger(passengerId) {
    let passengers = mongoHelper.getDb().collection("passenger");
    return new Promise(function(resolve, reject) {
        try {
            passengerId = new mongo.ObjectID(passengerId);
            passengers.findOne({"_id": passengerId}, function(err, record) {
                if (err) {
                    reject(err);
                    return null;
                };
                resolve(record);
            });
        } catch(err) {
            reject(err);
        }
    })
}

function createAadvantageId() {
    return _.toUpper(randomstring.generate(7));
}
