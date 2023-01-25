const utils = require('../../utils.js');
const fs = require('fs'); 
const HDWalletProvider = require("@truffle/hdwallet-provider");
const express = require('express');
const validator = require('express-validator');
const keccak256 = require('keccak256')
const router = express.Router()
router.use(express.json());

var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/bestonchain/";

var agentkey = JSON.parse(fs.readFileSync(privkeyPath+"agent.json")).privkey;
var buyerkey = JSON.parse(fs.readFileSync(privkeyPath+"buyer.json")).privkey;
var sellerkey = JSON.parse(fs.readFileSync(privkeyPath+"seller.json")).privkey;

var accPrivKeys = [agentkey, buyerkey, sellerkey];
var providerURL = "http://127.0.0.1:8545";
var provider = new HDWalletProvider(accPrivKeys, providerURL);

var digitaltwinpath = '/home/yih/Documents/dev/beston-dapps/build/contracts/DigitalTwin.json';
var digitaltwinAddr = "0x431379c85a19c9f8Aa7C2d42e01001FfbbE60569";
var digitaltwininstance = utils.getContract("addr",digitaltwinAddr,provider,digitaltwinpath); // get the digitaltwin contract instance

router.post('/seller/mint',
    validator.check("tkid").exists().withMessage("Input should contain field 'tkid'."),
    validator.check("GTIN").exists().withMessage("Input should contain field 'GTIN'."),
    validator.check("net_weight").exists().withMessage("Input should contain field 'net_weight'."),
    validator.check("packaging_date").exists().withMessage("Input should contain field 'packaging_date'."),
    validator.check("batch_num").exists().withMessage("Input should contain field 'batch_num'."),
    validator.check("serial_num").exists().withMessage("Input should contain field 'serial_num'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var gas = request.body.gas;
            var gtin = request.body.GTIN;
            var weight = request.body.net_weight;
            var metadata = gtin + weight;
            var datahash = keccak256(metadata).toString('hex');

            digitaltwininstance.then(value => {
                value.methods.mint(tkid,datahash).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Minting new token: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to mint token: ${tkid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new token name."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.post('/seller/update', 
    validator.check("tkid").exists().withMessage("Input should contain field 'tkid'."),
    validator.check("GTIN").exists().withMessage("Input should contain field 'GTIN'."),
    validator.check("net_weight").exists().withMessage("Input should contain field 'net_weight'."),
    validator.check("packaging_date").exists().withMessage("Input should contain field 'packaging_date'."),
    validator.check("batch_num").exists().withMessage("Input should contain field 'batch_num'."),
    validator.check("serial_num").exists().withMessage("Input should contain field 'serial_num'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var gas = request.body.gas;
            var gtin = request.body.GTIN;
            var weight = request.body.net_weight;
            var metadata = gtin + weight;
            var datahash = keccak256(metadata).toString('hex');
    
            digitaltwininstance.then(value => {
                value.methods.update(tkid,datahash).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating token details: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to update token: ${tkid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing token name."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

/**
 * agent uses the below 2 routes to verify a product and its packaging, after a token is offered as a product (ownership transferred to agent)
 * status field of the request should be true or false
 * Todo: to test following the event sequence
 */
router.post('/agent/recognize', 
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("status").exists().withMessage("Input should contain field 'status'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var status = request.body.status;
            var gas = request.body.gas;

            digitaltwininstance.then(value => {
                value.methods.recognize(productid,status).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating halal verification result: ${productid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to recognize packaging of token: ${productid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing token name."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.post('/agent/verify', 
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("status").exists().withMessage("Input should contain field 'status'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var status = request.body.status;
            var gas = request.body.gas;

            digitaltwininstance.then(value => {
                value.methods.verify(productid,status).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating halal verification result: ${productid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to verify token: ${productid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing token name."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.post('/seller/burn', 
    validator.check("tkid").exists().withMessage("Input should contain field 'tkid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var gas = request.body.gas;

            digitaltwininstance.then(value => {
                value.methods.burn(tkid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Burning token: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to burn token: ${tkid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. You can only burn an existing token that is owned by you."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/token', 
    validator.check("tkid").exists().withMessage("Input should contain field 'tkid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.query.tkid;

            digitaltwininstance.then(value => {
                value.methods.queryToken(tkid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"tkid": tkid, "internal_id": result[0], "datahash": result[1], "recognition_result":result[2], "verification_result":result[3], "owner":result[4]});
                })
                .catch((error) => {
                    console.log(`Failed to query token: ${tkid}`);
                    console.log(error);

                    if (error.message.includes("execution reverted")) {
                        response.write(JSON.stringify({"server_response":"Please enter an existing token name."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

// old viewall - can only view all tkids
router.get('/view/all',
    (request, response) => {
        digitaltwininstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                console.log(result);
                response.json({"tkids": result});
            })
            .catch((error) => {
                console.log("Failed to query all tokens");
                console.log(error);

                if (error.message.includes("contract owner")) {
                    response.write(JSON.stringify({"server_response":"Only contract owner can query all tokens."}));
                } else {
                    response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                }
                response.end();
            })
        })
    });

router.get('/view/tokens',
    (request, response) => {
        digitaltwininstance.then(value => {
            value.methods.queryAllFields().call({from: request.body.bcacc})
            .then((result) => {
                var tk = {};
                var tkarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    tk.tkid = result[0][i];
                    tk.internal_id = result[1][i];
                    tk.datahash = result[2][i];
                    tk.recognition_result = result[3][i];
                    tk.verification_result = result[4][i];
                    tk.owner = result[5][i];
                    tkarray.push({...tk});
                }
                console.log(tkarray);
                response.json(tkarray);
            })
            .catch((error) => {
                console.log("Failed to query all tokens");
                console.log(error);

                if (error.message.includes("execution reverted")) {
                    response.write(JSON.stringify({"server_response":"Only contract owner can query all tokens."}));
                } else {
                    response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                }
                response.end();
            })
        })
    });

module.exports=router