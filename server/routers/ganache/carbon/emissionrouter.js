const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var etrackingpath = './build/contracts/EmissionTracking.json';
var etrackingaddr = "0x217207c1c68d88607F64930A3A2Ef5EA0402226F";
var etrackinginstance = utils.getContract("addr",etrackingaddr,provider,etrackingpath);
// var etrackinginstance = utils.getContract("netId",netId,providerURL,etrackingpath);

router.post('/log', 
    validator.check("emissionid").exists().withMessage("Input should contain field 'emissionid'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'."),
    validator.check("herdid").exists().withMessage("Input should contain field 'herdid'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var emissionid = request.body.emissionid;
            var amount = request.body.amount;
            var feedtype = request.body.feedtype;
            var herdid = request.body.herdid;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            etrackinginstance.then(value => {
                value.methods.logEmission(emissionid,amount,feedtype,herdid,datetime).send({from: request.body.bcacc, gas: gas})
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
                    } else if (error.message.includes("Herd is not registered.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. You can only log an emission for a registered herd."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view', 
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
                    response.json({"emissionid":emissionid,"herdid":result[0],"amount":result[1],"feedtype":result[2],"datetime":result[3],"blocktime":result[4]});
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

router.get('/view/emissions',
    (request, response) => {
        etrackinginstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                var emission = {};
                var emissionarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    emission.emissionid = result[0][i];
                    emission.herdid = result[1][i];
                    emission.value = result[2][i];
                    emission.feedtype = result[3][i];
                    emission.datetime = result[4][i];
                    emission.blocktime = result[5][i];
                    emissionarray.push({...emission});
                }
                console.log(emissionarray);
                response.json(emissionarray);
            })
            .catch((error) => {
                console.log("Failed to query all emissions.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

router.get('/verify/value', 
    validator.check("control").exists().withMessage("Input should contain field 'control'."),
    validator.check("treatment").exists().withMessage("Input should contain field 'treatment'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'"),
    validator.check("feedtype").isInt().withMessage("Input should be an interger in the range [0,2]."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var control = request.body.control;
            var treatment = request.body.treatment;
            var feedtype = request.body.feedtype;

            etrackinginstance.then(value => {
                value.methods.verifyEmissionValue(control,treatment,feedtype).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"verification_result":result[0]});
                })
                .catch((error) => {
                    console.log(`Failed to verify the specified emission records`);
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

router.get('/link', 
    validator.check("emissionid").exists().withMessage("Input should contain field 'emissionid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var emissionid = request.query.emissionid;

            farmreginstance.then(value => {
                value.methods.queryFarm(emissionid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"emissionid": emissionid, "feedid": result[0]});
                })
                .catch((error) => {
                    console.log(`Failed to query emission: ${emissionid}`);
                    console.log(error);

                    if (error.message.includes("Emission does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Emission does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });
    
module.exports = router;