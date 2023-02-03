const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var netId = '5777';
var providerURL = 'http://127.0.0.1:7545';

var farmregpath = './build/contracts/FarmRegistry.json';
var farmreginstance = utils.getContract("netId",netId,providerURL,farmregpath);

router.post('/register', 
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var farmid = request.body.farmid;
            var gas = request.body.gas;

            farmreginstance.then(value => {
                value.methods.registerFarm(farmid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Registering a farm: ${farmid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to register farm: ${farmid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Farm already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Farm ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view', 
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var farmid = request.query.farmid;

            farmreginstance.then(value => {
                value.methods.queryFarm(farmid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"farmid": farmid, "farmer_address": result[0]});
                })
                .catch((error) => {
                    console.log(`Failed to query farm: ${farmid}`);
                    console.log(error);

                    if (error.message.includes("Farm does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Farm does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });