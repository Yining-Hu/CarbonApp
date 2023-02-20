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

var ftrackingpath = './build/contracts/FeedTracking.json';
var ftrackingaddr = "0x52E44F1fD16e62b020b5CabF91A19b9203B381Aa";
var ftrackinginstance = utils.getContract("addr",ftrackingaddr,provider,ftrackingpath); // get the digitaltwin contract instance

router.post('/log',
    validator.check("feedid").exists().withMessage("Input should contain field 'feedid'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'."),
    validator.check("animalid").exists().withMessage("Input should contain field 'animalid'."),
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
            var animalid = request.body.animalid;
            var dmi = request.body.dmi;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            ftrackinginstance.then(value => {
                value.methods.logFeed(feedid,feedtype,animalid,dmi,datetime).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging feed ${feedid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to log feed ${feedid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new feed id, and an existing animal id."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
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

module.exports = router;