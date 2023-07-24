const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router();
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var herdregpath = './build/contracts/HerdRegistry.json';
var herdregaddr = "";
var herdreginstance = utils.getContract("addr",herdregaddr,provider,herdregpath);
// var herdreginstance = utils.getContract("netId",netId,providerURL,herdregpath);

router.post('/register', 
    validator.check("herdid").exists().withMessage("Input should contain field 'herdid'."),
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("num_of_animals").exists().withMessage("Input should contain field 'num_of_animals'."),
    validator.check("num_of_animals").isInt().withMessage("Input should be an interger."),
    validator.check("days_on_farm").exists().withMessage("Input should contain field 'days_on_farm'."),
    validator.check("days_on_farm").isInt().withMessage("Input should be an interger."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var herdid = request.body.herdid;
            var farmid = request.body.farmid;
            var num_of_animals = request.body.num_of_animals;
            var days_on_farm = request.body.days_on_farm;
            var gas = request.body.gas;

            herdreginstance.then(value => {
                value.methods.registerHerd(herdid,farmid,num_of_animals,days_on_farm).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Registering a herd: ${herdid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to register herd: ${herdid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Herd already exists")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Herd ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view', 
    validator.check("herdid").exists().withMessage("Input should contain field 'herdid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var herdid = request.query.herdid;

            herdreginstance.then(value => {
                value.methods.queryHerd(herdid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"herdid": herdid, "farmid": result[0], "num_of_animals": result[1], "days_on_farm": result[2]});
                })
                .catch((error) => {
                    console.log(`Failed to query herd: ${herdid}`);
                    console.log(error);

                    if (error.message.includes("Herd does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Herd does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/herds',
    (request, response) => {
        herdreginstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                var herd = {};
                var herdarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    herd.herdid = result[0][i];
                    herd.farmid = result[1][i];
                    herd.num_of_animals = result[2][i];
                    herd.days_on_farm = result[3][i];
                    herdarray.push({...herd});
                }
                console.log(herdarray);
                response.json(herdarray);
            })
            .catch((error) => {
                console.log("Failed to query all herds.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;