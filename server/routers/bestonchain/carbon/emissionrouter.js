const utils = require('../../../utils.js');
const fs = require('fs'); 
const HDWalletProvider = require("@truffle/hdwallet-provider");
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/bestonchain/";

const agentkey = JSON.parse(fs.readFileSync(privkeyPath + "agent.json")).privkey;
const buyerkey = JSON.parse(fs.readFileSync(privkeyPath + "buyer.json")).privkey;
const sellerkey = JSON.parse(fs.readFileSync(privkeyPath + "seller.json")).privkey;
const bestonkey = JSON.parse(fs.readFileSync(privkeyPath + "beston.json")).privkey;
const farmerkey = JSON.parse(fs.readFileSync(privkeyPath + "farmer.json")).privkey;
const accPrivKeys = [agentkey, buyerkey, sellerkey, bestonkey, farmerkey];

var providerURL = "http://127.0.0.1:8545";
var provider = new HDWalletProvider(accPrivKeys, providerURL);

var etrackingpath = './build/contracts/EmissionTracking.json';
var etrackingaddr = "0xb17CcB0c31cc578b873B7f5Bacf289c636F1b127";
var etrackinginstance = utils.getContract("addr",etrackingaddr,provider,etrackingpath); // get the digitaltwin contract instance

router.post('/log', 
    validator.check("emissionid").exists().withMessage("Input should contain field 'emissionid'."),
    validator.check("value").exists().withMessage("Input should contain field 'value'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'."),
    validator.check("animalid").exists().withMessage("Input should contain field 'animalid'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var emissionid = request.body.emissionid;
            var value = request.body.value;
            var feedtype = request.body.feedtype;
            var animalid = request.body.animalid;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            etrackinginstance.then(value => {
                value.methods.logFeed(emissionid,value,feedtype,animalid,datetime).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging feed ${emissionid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to log feed ${emissionid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Emission ID exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. You can only log feed for a registered animal."}));
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
    validator.check("emissionid").exists().withMessage("Input should contain field 'emissionid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var emissionid = request.query.emissionid;

            etrackinginstance.then(value => {
                value.methods.queryEmission(emissionid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"emissionid":emissionid,"animalid":result[0],"value":result[1],"ingredient":result[2],"datetime":result[3],"blocktime":result[4]});
                })
                .catch((error) => {
                    console.log(`Failed to query Emission ${emissionid}.`);
                    console.log(error);

                    if (error.message.includes("Emission ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Emission ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/verify/time', 
    validator.check("emissionid").exists().withMessage("Input should contain field 'emissionid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var emissionid = request.query.emissionid;

            etrackinginstance.then(value => {
                value.methods.verifyEmissionTime(emissionid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"emissionid":emissionid,"verification_result":result[0]});
                })
                .catch((error) => {
                    console.log(`Failed to verify time of Emission ${emissionid}.`);
                    console.log(error);

                    if (error.message.includes("Emission ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Emission ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/verify/value', 
    validator.check("control").exists().withMessage("Input should contain field 'control'."),
    validator.check("test").exists().withMessage("Input should contain field 'test'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var control = request.query.control;
            var test = request.query.test;

            etrackinginstance.then(value => {
                value.methods.verifyEmissionValue(control,test).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"verification_result":result});
                })
                .catch((error) => {
                    console.log(`Failed to verify value of specified emissions.`);
                    console.log(error);

                    if (error.message.includes("same number of emission records")) {
                        response.write(JSON.stringify({"server_response":"Please supply same number of emission records for the control group and the test group."}));
                    } else if (error.message.includes("Emission ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Emission ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

module.exports = router;