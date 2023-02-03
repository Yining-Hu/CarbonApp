// Todo: still need to update the contract address and error messages

const utils = require('../../utils.js');
const fs = require('fs'); 
const HDWalletProvider = require("@truffle/hdwallet-provider");
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/bestonchain/";

var agentkey = JSON.parse(fs.readFileSync(privkeyPath+"agent.json")).privkey;
var buyerkey = JSON.parse(fs.readFileSync(privkeyPath+"buyer.json")).privkey;
var sellerkey = JSON.parse(fs.readFileSync(privkeyPath+"seller.json")).privkey;

var accPrivKeys = [agentkey, buyerkey, sellerkey];
var providerURL = "http://127.0.0.1:8545";
var provider = new HDWalletProvider(accPrivKeys, providerURL);

var animalregpath = './build/contracts/AnimalRegistry.json';
var animalregaddr = "";
var animalreginstance = utils.getContract("addr",animalregaddr,provider,animalregpath); // get the digitaltwin contract instance

router.post('/register', 
    validator.check("animalid").exists().withMessage("Input should contain field 'animalid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var animalid = request.body.animalid;
            var gas = request.body.gas;

            animalreginstance.then(value => {
                value.methods.registerAnimal(animalid).send({from: request.body.bcacc, gas: gas})
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