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

var cbtpath = './build/contracts/CarbonToken.json';
var cbtaddr = "0x1E225764BA20dD6e7c985856F6D5Df980760E143";
var cbtinstance = utils.getContract("addr",cbtaddr,provider,cbtpath); // get the digitaltwin contract instance

router.post('/issue', 
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("feedids").exists().withMessage("Input should contain field 'feedids'."),
    validator.check("projectid").exists().withMessage("Input should contain field 'projectid'."),
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
            var projectid = request.body.projectid;
            var gas = request.body.gas;

            cbtinstance.then(value => {
                value.methods.issue(cbtokenid,amount,feedids,projectid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Issuing ${amount} amount of ${cbtokenid} Carbon Tokens for the project ${projectid}, Txn hash: ${result.transactionHash}`);
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
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only admin can issue a new carbon token to the specified address for feed ids within the specified range."}));
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

router.get('/balance',
    validator.check("internalid").exists().withMessage("Input should contain field 'internalid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var internalid = request.query.internalid;

            cbtinstance.then(value => {
                value.methods.balanceOf(request.body.bcacc, internalid).call()
                .then((result) => {
                    console.log(result);
                    response.json({"balance":result});
                })
                .catch((error) => {
                    console.log(`Failed to get balance of account ${request.body.bcacc}.`);
                    console.log(error);

                    if (error.message.includes("ERC1155")) {
                        response.write(JSON.stringify({"server_response":"Please specify a valid user."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/cbtoken', 
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.query.cbtokenid;

            cbtinstance.then(value => {
                value.methods.queryCarbonToken(cbtokenid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"cbtokenid":cbtokenid,"projectid":result[0],"internalid":result[1],"amount":result[2]});
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

router.get('/view/cbtokens',
    (request, response) => {
        cbtinstance.then(value => {
            value.methods.queryAllCarbonToken().call({from: request.body.bcacc})
            .then((result) => {
                var cbt = {};
                var cbtarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    cbt.cbtokenid = result[0][i];
                    cbt.projectid = result[1][i];
                    cbt.internalid = result[2][i];
                    cbt.amount = result[3][i];
                    cbtarray.push({...cbt});
                }
                console.log(cbtarray);
                response.json(cbtarray);
            })
            .catch((error) => {
                console.log("Failed to query all cbtokens.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
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

router.get('/view/distributions',
    (request, response) => {
        cbtinstance.then(value => {
            value.methods.queryAllDistribution().call({from: request.body.bcacc})
            .then((result) => {
                var distribution = {};
                var distributionarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    distribution.distributionid = result[0][i];
                    distribution.cbtokenid = result[1][i];
                    distribution.amount = result[2][i];
                    distribution.farmer = result[3][i];
                    distribution.paid = result[4][i];
                    distributionarray.push({...distribution});
                }
                console.log(distributionarray);
                response.json(distributionarray);
            })
            .catch((error) => {
                console.log("Failed to query all distributions.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;