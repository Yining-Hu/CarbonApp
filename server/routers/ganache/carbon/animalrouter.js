const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router();
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var animalregpath = './build/contracts/AnimalRegistry.json';
var animalregaddr = "0x5B3414A133b2DCcB3b9CA9D56A153948950F2e0f";
var animalreginstance = utils.getContract("addr",animalregaddr,provider,animalregpath);
// var animalreginstance = utils.getContract("netId",netId,providerURL,animalregpath);

router.post('/register', 
    validator.check("animalid").exists().withMessage("Input should contain field 'animalid'."),
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("animalgroup").exists().withMessage("Input should contain field 'animalgroup'."),
    validator.check("animalgroup").isInt().withMessage("Input should be an interger in the range [0,2]."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var animalid = request.body.animalid;
            var farmid = request.body.farmid;
            var animalgroup = request.body.animalgroup;
            var gas = request.body.gas;

            animalreginstance.then(value => {
                value.methods.registerAnimal(animalid,farmid,animalgroup).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Registering an animal: ${animalid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to register animal: ${animalid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Animal already exists")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Animal ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view', 
    validator.check("animalid").exists().withMessage("Input should contain field 'animalid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var animalid = request.query.animalid;

            animalreginstance.then(value => {
                value.methods.queryAnimal(animalid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"animalid": animalid, "farmid": result[0], "animal_group": result[1], "dates_on_farm": result[2]});
                })
                .catch((error) => {
                    console.log(`Failed to query animal: ${animalid}`);
                    console.log(error);

                    if (error.message.includes("Animal does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Animal does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/animals',
    (request, response) => {
        animalreginstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                var animal = {};
                var animalarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    animal.animalid = result[0][i];
                    animal.farmid = result[1][i];
                    animal.group = result[2][i];
                    animal.dates = result[3][i];
                    animalarray.push({...animal});
                }
                console.log(animalarray);
                response.json(animalarray);
            })
            .catch((error) => {
                console.log("Failed to query all animals.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;