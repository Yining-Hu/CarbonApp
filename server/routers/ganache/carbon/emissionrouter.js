const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var etrackingpath = './build/contracts/EmissionTracking.json';
var etrackingaddr = "";
var etrackinginstance = utils.getContract("addr",etrackingaddr,provider,etrackingpath);
// var etrackinginstance = utils.getContract("netId",netId,providerURL,etrackingpath);

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

            etrackinginstance.then(value => {
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
            var feedid = request.query.feedid;

            etrackinginstance.then(value => {
                value.methods.queryEmission(feedid).call({from: request.body.bcacc})
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

router.get('/verify/value', 
    validator.check("control").exists().withMessage("Input should contain field 'control'."),
    validator.check("treatment").exists().withMessage("Input should contain field 'treatment'."),
    validator.check("treatmenttype").exists().withMessage("Input should contain field 'treatmenttype'"),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var control = request.query.control;
            var treatment = request.query.treatment;
            var treatmenttype = request.query.treatmenttype;

            etrackinginstance.then(value => {
                value.methods.verifyEmissionValue(control,treatment,treatmenttype).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"verification_result":result});
                })
                .catch((error) => {
                    console.log(`Failed to verify value of specified emission records.`);
                    console.log(error);

                    if (error.message.includes("same number of emission records")) {
                        response.write(JSON.stringify({"server_response":"Please supply same number of emission records for the control group and the test group."}));
                    } else if (error.message.includes("Emission ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Emission ID does not exist."}));
                    } else if (error.message.includes("emission records with regular")) {
                        response.write(JSON.stringify({"server_response":"Please only enter emission records with regular feed."}));
                    } else if (error.message.includes("the specified treatment")) {
                        response.write(JSON.stringify({"server_response":"Please only enter emission records with the specified treatment type."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });
    
module.exports = router;