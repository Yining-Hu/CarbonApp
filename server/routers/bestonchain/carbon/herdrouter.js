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
const ftskey = JSON.parse(fs.readFileSync(privkeyPath + "fts.json")).privkey;
const sfkey = JSON.parse(fs.readFileSync(privkeyPath + "sf.json")).privkey;
const auditorkey = JSON.parse(fs.readFileSync(privkeyPath + "auditor.json")).privkey;
const accPrivKeys = [agentkey,buyerkey,sellerkey,bestonkey,farmerkey,ftskey,sfkey,auditorkey];

var providerURL = "http://127.0.0.1:8545";
var provider = new HDWalletProvider(accPrivKeys, providerURL);

var herdregpath = './build/contracts/HerdRegistry.json';
var herdregaddr = "0x5e43a81DADABe262dF2714706666561B293321e4";
var herdreginstance = utils.getContract("addr",herdregaddr,provider,herdregpath); // get the digitaltwin contract instance

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
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to register herd: ${herdid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new herd id."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
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