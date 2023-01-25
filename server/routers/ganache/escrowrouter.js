const utils = require('../../utils.js');
const fs = require('fs'); 
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var netId = '5777';
var providerURL = 'http://127.0.0.1:7545';
var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/ganache/";

var escrowpath = './build/contracts/Escrow.json';
var escrowinstance = utils.getContract("netId",netId,providerURL,escrowpath);

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

router.post('/buyer/deposit',
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("deposit").exists().withMessage("Input should contain field 'deposit'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var deposit = request.body.deposit;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.BuyerDepositWithBTK(productid, deposit).send({from: request.body.bcacc, gas: gas})
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
                    } else if (error.message.includes("exceeds balance")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the deposit amount doesn't exceed your balance."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                value.methods.AgentApproveWithBTK(productid).send({from: request.body.bcacc, gas:gas})
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
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Agent cannot approve payment of unverified product."}));
                    } else if (error.message.includes("timeout")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Agent can only approve payment before the specified timeout."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                value.methods.AgentDenyWithBTK(productid).send({from: request.body.bcacc, gas:gas})
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
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Agent can only issue the return after the specified timeout."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                    product.escrow_state = result[2][i];
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

// test routes for buying/selling btk and getting btk addr
router.post('/buy/btk',
    validator.check("amountTobuy").exists().withMessage("Input should contain field 'amountTobuy'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var amountTobuy = request.body.amountTobuy;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.buyBTK().send({from: request.body.bcacc, value:amountTobuy, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Buying ${amountTobuy} BTK, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to buy ${amountTobuy} BTK, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("reserve")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the amount to buy doesn't exceed what's in reserve."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.post('/sell/btk',
    validator.check("amountTosell").exists().withMessage("Input should contain field 'amountTosell'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var amountTosell = request.body.amountTosell;
            var gas = request.body.gas;

            escrowinstance.then(value => {
                value.methods.sellBTK(amountTosell).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Selling ${amountTosell} BTK to Escrow, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to sell ${amountTosell} BTK to Escrow, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("allowance")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the amount to sell doesn't exceed the allowance."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/addr/btk', (request, response) => {
    escrowinstance.then(value => {
        value.methods.btk().call()
        .then((result) => {
            console.log(result);
            response.json({'BToken adddress':result});
        })
        .catch((error) => {
            console.log("Failed to retrieve the BToken address.");
            console.log(error);

            response.json({"server_response":"Failed to retrieve the BToken address."});
        })
    })
})

// route for getting Ether balance
router.get('/balance/matic', (request, response) => {
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
