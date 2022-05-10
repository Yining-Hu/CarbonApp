const utils = require('./utils.js');
const express = require('express');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const keccak256 = require('keccak256')
const validator = require('express-validator');

const path = './build/contracts/DigitalTwin.json';
const escrowpath = './build/contracts/Escrow.json';

const netId = '5777';
const provider = 'http://127.0.0.1:7545';

var instance = utils.getContract(netId,provider,path); // get the contract instance
var escrowinstance = utils.getContract(netId,provider,escrowpath);

// contract owner address on local ganache network
var sender = "0x12947B8d2568DFf6396a25c0E9A062D5c7122D9C";
var buyer = "0x877aDf99A29e69C8f4Bb22E2aeA4C7eCefb5Cf2c";
var seller = "0x26eA7555392F9Cbc54c12D658B1A0a71CCBC2B9a";

var app = express();

app.use(express.json());

/*
 * routes for interacting with DigitalTwin.sol
 * To do: to add more fields in the mint route
 * To do: input check does not validate input type - for boolean and int
 */
app.post('/seller/mint', 
    validator.check("tkid").exists(),
    validator.check("GTIN").exists(),
    validator.check("net_weight").exists(),
    validator.check("gas").exists(),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var gtin = request.body.GTIN;
            var weight = request.body.net_weight;
            var gas = request.body.gas;
            var metadata = gtin + weight;
            var datahash = keccak256(metadata).toString('hex');

            instance.then(value => {
                value.methods.mint(tkid,datahash).send({from: sender, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Minting new token: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to mint token: ${tkid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Token already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new token name."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

app.post('/seller/update', 
    validator.check("tkid").exists(),
    validator.check("GTIN").exists(),
    validator.check("net_weight").exists(),
    validator.check("gas").exists(),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var gtin = request.body.GTIN;
            var weight = request.body.net_weight;
            var gas = request.body.gas;
            var metadata = gtin + weight;
            var datahash = keccak256(metadata).toString('hex');
    
            instance.then(value => {
                value.methods.update(tkid,datahash).send({from: sender, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating token details: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to update token: ${tkid}, Txn hash: ${txnhash}`);
                    console.log(error);
    
                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Token does not exist.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please enter an existing token name."}));
                    } else if (error.message.includes("token owner")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Only the token owner can update the token."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

// seller uses this route to verify a product. status field of the request should be true or false
app.post('/seller/verify', 
    validator.check("tkid").exists(),
    validator.check("status").exists(),
    // To do: isBoolean is not defined
    // validator.check("status"),isBoolean(),
    validator.check("gas").exists(),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var status = request.body.status;
            var gas = request.body.gas;

            instance.then(value => {
                value.methods.verify(tkid,status).send({from: seller, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating halal verification result: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to verify token: ${tkid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Token does not exist.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please enter an existing token name."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

app.post('/seller/burn', 
    validator.check("tkid").exists(),
    validator.check("gas").exists(),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.body.tkid;
            var gas = request.body.gas;

            instance.then(value => {
                value.methods.burn(tkid).send({from: sender, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Burning token: ${tkid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to burn token: ${tkid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Token does not exist.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please enter an existing token name."}));
                    } else if (error.message.includes("token owner")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Only the token owner can update the token."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

app.get('/viewtoken', 
    validator.check("tkid").exists(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var tkid = request.query.tkid;

            instance.then(value => {
                value.methods.queryToken(tkid).call({from:sender})
                .then((result) => {
                    console.log(result);
                    response.json({"tokenid": tkid, "internal_id": result[0], "datahash": result[1], "verification_result":result[2], "owner":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query token: ${tkid}`);
                    console.log(error);

                    if (error.message.includes("Token does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Token does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

app.get('/viewalltokens',

    (request, response) => {
        instance.then(value => {
            value.methods.queryAll().call({from:sender})
            .then((result) => {
                console.log(result);
                response.json({"tokenids": result});
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

/*
 * routes for interacting with Escrow.sol 
 */

app.post('/seller/offerproduct',
    validator.check("productid").exists(),
    validator.check("price").isInt(),
    validator.check("price").exists(),
    validator.check("gas").exists(),
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
                value.methods.offer(productid,price).send({from: seller, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Listing new product: ${productid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to list product: ${productid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Product is already offered.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new product name."}));
                    } else if (error.message.includes("Product token is not minted.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Product token is not minted. Please mint token before offering."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

app.post('/buyer/deposit',
    validator.check("productid").exists(),
    validator.check("paymentvalue").isInt(),
    validator.check("paymentvalue").exists(),
    validator.check("gas").exists(),
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
                value.methods.BuyerDeposit(productid).send({from: buyer, value: paymentvalue, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Buyer sending deposit for product: ${productid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to send deposit for product: ${productid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("deposit")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure deposit covers both the product price and agent fee."}));
                    } else if (error.message.includes("not on offer")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the product is on offer and no deposit has been made."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

app.post('/seller/redeem',
    validator.check("productid").exists(),
    validator.check("gas").exists(),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.SellerRedeem(productid).send({from: seller, gas:gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Transferring remaining payment of product: ${productid} to seller, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to transfer payment of product: ${productid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Product does not exist.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing product name."}));
                    } else if (error.message.includes("deposit")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"No deposit found for this product."}));
                    } else if (error.message.includes("unverified")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Seller cannot redeem payment of unverified product."}));
                    } else if (error.message.includes("timeout")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Seller can only redeem before the specified timeout."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

app.post('/buyer/deny',
    validator.check("productid").exists(),
    validator.check("gas").exists(),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.BuyerDeny(productid).send({from: buyer, gas:gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Transferring refund of product: ${productid} to buyer, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to transfer refund of product: ${productid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Product does not exist.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing product name."}));
                    } else if (error.message.includes("deposit")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"No deposit found for this product."}));
                    } else if (error.message.includes("timeout")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Buyer can only claim the return after the specified timeout."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

// currently buyer uses this route to check the verification result of a product
// To do: to enable all participants to view
app.get('/viewverification',
    validator.check("productid").exists(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.query.productid;

            escrowinstance.then(value => {
                value.methods.VerifyProduct(productid).call({from: buyer})
                .then((result) => {
                    console.log(result);
                    console.log(`Verifying product identity: ${productid}`);
                    response.write(JSON.stringify({"verification_result": result}));
                    response.end('\n');
                })
                .catch((error) => {
                    console.log(`Failed to verify product: ${productid}`);
                    console.log(error);

                    if (error.message.includes("Product does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Txn reverted. Please enter an existing product name."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

app.get('/viewproduct', 
    validator.check("productid").exists(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.query.productid;

            escrowinstance.then(value => {
                value.methods.QueryProduct(productid).call({from:buyer})
                .then((result) => {
                    console.log(result);
                    response.json({"productid": productid, "price": result[0], "escrow_state": result[1], "verification_result":result[2]});
                })
                .catch((error) => {
                    console.log(`Failed to query product: ${productid}`);
                    console.log(error);

                    if (error.message.includes("Product does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Product does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

app.listen(3000);
