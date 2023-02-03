const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var netId = '5777';
var providerURL = 'http://127.0.0.1:7545';

var ftrackingpath = './build/contracts/FeedTracking.json';
var ftrackinginstance = utils.getContract("netId",netId,providerURL,ftrackingpath);

router.post('/log',
    validator.check("feedid").exists().withMessage("Input should contain field 'feedid'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'."),
    validator.check("dmi").exists().withMessage("Input should contain field 'dmi'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var feedid = request.body.feedid;
            var feedtype = request.body.feedtype;
            var dmi = request.body.dmi;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            ftrackinginstance.then(value => {
                value.methods.logFeed(feedid,feedtype,dmi,datetime).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging feed ${feedid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to log feed ${feedid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Feed ID already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Feed ID."}));
                    } else if (error.message.includes("Animal is not registered.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. You can only log feed for a registered animal."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/query', 
    validator.check("feedid").exists().withMessage("Input should contain field 'feedid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var feedid = request.query.feedid;

            ftrackinginstance.then(value => {
                value.methods.queryFeed(feedid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"feedid":feedid,"ingredient":result[0],"animalid":result[1],"dmi":result[2],"datetime":result[3],"blocktime":result[4]});
                })
                .catch((error) => {
                    console.log(`Failed to query Feed ${feedid}.`);
                    console.log(error);

                    if (error.message.includes("Feed ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Feed ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/verify', 
    validator.check("feedid").exists().withMessage("Input should contain field 'feedid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var feedid = request.query.feedid;

            ftrackinginstance.then(value => {
                value.methods.verifyFeedTime(feedid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"feedid":feedid,"verification_result":result[0]});
                })
                .catch((error) => {
                    console.log(`Failed to verify time of Feed ${feedid}.`);
                    console.log(error);

                    if (error.message.includes("Feed ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Feed ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });