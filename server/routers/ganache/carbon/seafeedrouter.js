const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var provider = 'http://127.0.0.1:7545';

var sfpath = './build/contracts/Seafeed.json';
var sfaddr = "0x991163f971904f99E9537E1b2e0A2367aDCf189b";
var sfinstance = utils.getContract("addr",sfaddr,provider,sfpath);

router.post('/log/production',
    validator.check("productionid").exists().withMessage("Input should contain field 'productionid'."),
    validator.check("batchid").exists().withMessage("Input should contain field 'batchid'."),
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("volume").exists().withMessage("Input should contain field 'volume'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productionid = request.body.productionid;
            var batchid = request.body.batchid;
            var farmid = request.body.farmid;
            var volume = request.body.volume;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logProduction(productionid,batchid,farmid,volume,datetime).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging production ${productionid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to log Production ${productionid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Production already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Production ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.post('/log/testing',
    validator.check("testingid").exists().withMessage("Input should contain field 'testingid'."),
    validator.check("temperature").exists().withMessage("Input should contain field 'temperature'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("productionid").exists().withMessage("Input should contain field 'productionid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var testingid = request.body.testingid;
            var temperature = request.body.temperature;
            var datetime = request.body.datetime;
            var productionid = request.body.productionid;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logTesting(testingid,temperature,datetime,productionid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging Testing ${testingid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to log Testing ${testingid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Testing already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Testing ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.post('/log/storage',
    validator.check("storageid").exists().withMessage("Input should contain field 'storageid'."),
    validator.check("manufacturer").exists().withMessage("Input should contain field 'manufacturer'."),
    validator.check("location").exists().withMessage("Input should contain field 'location'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("bestbefore").exists().withMessage("Input should contain field 'bestbefore'."),
    validator.check("testingid").exists().withMessage("Input should contain field 'testingid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var storageid = request.body.storageid;
            var manufacturer = request.body.manufacturer;
            var location = request.body.location;
            var datetime = request.body.datetime;
            var bestbefore = request.body.bestbefore;
            var testingid = request.body.testingid;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logStorage(storageid,manufacturer,location,datetime,bestbefore,testingid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging Storage ${storageid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to log Storage ${storageid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Storage already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Testing ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })