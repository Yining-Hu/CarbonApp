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

var cbtpath = './build/contracts/CarbonToken.json';
var cbtaddr = "0xA8557fB5535FAD27422a3c2b1BCf325Bf3f511B2";
var cbtinstance = utils.getContract("addr",cbtaddr,provider,cbtpath); // get the digitaltwin contract instance

router.post('/issue', 
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("feedids").exists().withMessage("Input should contain field 'feedids'."),
    validator.check("start").exists().withMessage("Input should contain field 'start'."),
    validator.check("end").exists().withMessage("Input should contain field 'end'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.body.cbtokenid;
            var amount = request.body.amount;
            var feedids = request.body.feedids;
            var start = request.body.start;
            var end = request.body.end;
            var gas = request.body.gas;

            cbtinstance.then(value => {
                value.methods.issue(cbtokenid,amount,feedids,start,end).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Issuing ${amount} amount of ${cbtokenid} Carbon Tokens for the period ${start}-${end}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to issue carbon token: ${cbtokenid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only admin can issue a new carbon token for feed ids within the specified range."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/distribute', 
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),
    validator.check("distributionid").exists().withMessage("Input should contain field 'distributionid'."),
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.body.cbtokenid;
            var distributionid = request.body.distributionid;
            var farmid = request.body.farmid;
            var amount = request.body.amount;
            var gas = request.body.gas;

            cbtinstance.then(value => {
                value.methods.distribute(cbtokenid,distributionid,farmid,amount).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`${distributionid}: Distributing ${amount} amount of ${cbtokenid} Carbon Tokens to farm ${farmid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to distribute carbon token: ${cbtokenid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only the admin can distribute carbon tokens with a valid id."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/update', 
    validator.check("distributionid").exists().withMessage("Input should contain field 'distributionid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var distributionid = request.body.distributionid;
            var gas = request.body.gas;

            cbtinstance.then(value => {
                value.methods.update(distributionid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating payment status of Distribution ${distributionid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to register animal: ${animalid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only the admin can update payment status of already issued carbon token."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view/cbtoken', 
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.query.cbtokenid;

            cbtinstance.then(value => {
                value.methods.queryDistribution(cbtokenid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"cbtokenid":cbtokenid,"internalid":result[0],"amount":result[1],"start":result[2],"end":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query Carbon Token ${cbtokenid}.`);
                    console.log(error);

                    if (error.message.includes("Carbon Token ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Carbon Token ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/distribution', 
    validator.check("distributionid").exists().withMessage("Input should contain field 'distributionid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var distributionid = request.query.distributionid;

            cbtinstance.then(value => {
                value.methods.queryDistribution(distributionid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"distributionid":distributionid,"cbtokenid":result[0],"amount":result[1],"farmer":result[2],"paid":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query distribution: ${distributionid}.`);
                    console.log(error);

                    if (error.message.includes("Distribution ID does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Distribution ID does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

module.exports = router;