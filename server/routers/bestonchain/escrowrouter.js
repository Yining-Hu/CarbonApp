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
var providerURL = "http://127.0.0.1:8545"
var provider = new HDWalletProvider(accPrivKeys, providerURL);

var escrowpath = '/home/yih/Documents/dev/beston-dapps/build/contracts/Escrow.json';
var escrowAddr = "0xb32752F6629C5bd1d4DDe50a0534D752F797E507";
var escrowinstance = utils.getContractByAddr(escrowAddr,provider,escrowpath); // get the escrow contract instance

router.post('/seller/offer',
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("price").isInt(),
    validator.check("price").exists(),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var price = request.body.price;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.offer(productid,price).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Listing new product: ${productid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to offer product: ${productid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new product name, and make sure the product token is minted."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.post('/buyer/deposit',
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("paymentvalue").isInt(),
    validator.check("paymentvalue").exists().withMessage("Input should contain field 'paymentvalue'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var paymentvalue = request.body.paymentvalue;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.BuyerDeposit(productid).send({from: request.body.bcacc, value: paymentvalue, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Buyer sending deposit for product: ${productid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to send deposit for product: ${productid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the product is on offer (without a deposit), and deposit covers both the product price and agent fee."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.post('/agent/approve',
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.AgentApprove(productid).send({from: request.body.bcacc, gas:gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Transferring remaining payment of product: ${productid} to seller, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to transfer remaining payment of product: ${productid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing product name, make sure a deposit is made, product is verified, and execute redeem before timeout."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/agent/deny',
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.AgentDeny(productid).send({from: request.body.bcacc, gas:gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Transferring refund of product: ${productid} to buyer, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to transfer refund of product: ${productid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing product name, make sure a deposit is made, and execute the refund after the specified timeout."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view/product', 
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.query.productid;

            escrowinstance.then(value => {
                value.methods.QueryProduct(productid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"productid": productid, "price": result[0], "escrow_state": result[1], "seller":result[2], "buyer":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query product: ${productid}`);
                    console.log(error);

                    if (error.message.includes("execution reverted")) {
                        response.write(JSON.stringify({"server_response":"Product does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/products',
    (request, response) => {
        escrowinstance.then(value => {
            value.methods.QueryAllProducts().call({from: request.body.bcacc})
            .then((result) => {
                var product = {};
                var productarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    product.productid = result[0][i];
                    product.price = result[1][i];
                    product.state = result[2][i];
                    product.seller = result[3][i];
                    product.buyer = result[4][i];
                    productarray.push({...product});
                }
                console.log(productarray);
                response.json(productarray);
            })
            .catch((error) => {
                console.log("Failed to query all tokens");
                console.log(error);
                response.json({"server_response":"Please check transaction parameters."});
            })
        })
    });

router.get('/balance', (request, response) => {
    var username = request.get('user-name');
    var user = JSON.parse(fs.readFileSync(privkeyPath+username+'.json'));
    var bcacc = user.bcacc;

    escrowinstance.then(value => {
        value.methods.GetBalance(bcacc).call({from: request.body.bcacc})
        .then((result) => {
            console.log(result);
            response.json({'balance':result});
        })
        .catch((error) => {
            console.log("Failed to query account balance");
            console.log(error);

            response.json({"server_response":"Please input a valid user account."});
        })
    })
})

module.exports=router
