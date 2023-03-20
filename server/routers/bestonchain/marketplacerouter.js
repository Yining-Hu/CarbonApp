const utils = require('../../utils.js');
const fs = require('fs'); 
const HDWalletProvider = require("@truffle/hdwallet-provider");
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/bestonchain/";
const directory = fs.opendirSync(privkeyPath)
let file;
let accPrivKeys = [];
while ((file = directory.readSync()) !== null) {
    let key = JSON.parse(fs.readFileSync(privkeyPath+file.name)).privkey;
    accPrivKeys.push(key);
}
directory.closeSync()

var providerURL = "http://127.0.0.1:8545"
var provider = new HDWalletProvider(accPrivKeys, providerURL);

var mppath = '/home/yih/Documents/dev/beston-dapps/build/contracts/MarketPlace.json';
var mpaddr = "0xF096f46a9d288Dc453E69aC21937A8bE15B075Ce";
var mpinstance = utils.getContract("addr",mpaddr,provider,mppath);

router.post('/seller/list',
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

            mpinstance.then(value => {
                value.methods.list(productid,price).send({from: request.body.bcacc, gas: gas})
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
                        console.log(`Failed to list product: ${productid}, Txn hash: ${txnhash}`);
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
    validator.check("deposit").exists().withMessage("Input should contain field 'deposit'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var deposit = request.body.deposit;
            var gas = request.body.gas;

            mpinstance.then(value => {
                value.methods.BuyerDepositWithBTK(productid,deposit).send({from: request.body.bcacc, gas: gas})
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
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the product is listed (without a deposit), deposit covers both the product price and agent fee and does not exceed your balance."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    });

router.post('/buyer/purchase',
    validator.check("productid").exists().withMessage("Input should contain field 'productid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productid = request.body.productid;
            var gas = request.body.gas;

            mpinstance.then(value => {
                value.methods.directPurchase(productid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Buyer purchasing product: ${productid}, Txn hash: ${result.transactionHash}`);
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
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please make sure the product is listed (without a deposit), and price does not exceed your balance."}));
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

            mpinstance.then(value => {
                value.methods.AgentApproveWithBTK(productid).send({from: request.body.bcacc, gas:gas})
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

            mpinstance.then(value => {
                value.methods.AgentDenyWithBTK(productid).send({from: request.body.bcacc, gas:gas})
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

            mpinstance.then(value => {
                value.methods.QueryProduct(productid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"productid": productid, "price": result[0], "purchase_state": result[1], "seller":result[2], "buyer":result[3]});
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
        mpinstance.then(value => {
            value.methods.QueryAllProducts().call({from: request.body.bcacc})
            .then((result) => {
                var product = {};
                var productarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    product.productid = result[0][i];
                    product.price = result[1][i];
                    product.purchase_state = result[2][i];
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

router.post('/buy/btk',
    validator.check("amountTobuy").exists().withMessage("Input should contain field 'amountTobuy'."),
    validator.check("to").exists().withMessage("Input should contain field 'to'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var amountTobuy = request.body.amountTobuy;
            var to = request.body.to;
            var gas = request.body.gas;

            mpinstance.then(value => {
                value.methods.buyBTK(to).send({from: request.body.bcacc, value:amountTobuy, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Buying ${amountTobuy} BTK, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to buy ${amountTobuy} BTK, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please ensure the amountTobuy is greater than 0 and less than the reserve."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                        response.end();
                    }
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

            mpinstance.then(value => {
                value.methods.sellBTK(amountTosell).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Selling ${amountTosell} BTK to MarketPlace, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to sell ${amountTosell} BTK to MarketPlace, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please the amount is greater than 0 and less than the allowance."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                        response.end();
                    }
                })
            })
        }
    });

router.get('/addr/btk', (request, response) => {
    mpinstance.then(value => {
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

module.exports=router
