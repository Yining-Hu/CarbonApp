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

var sfpath = './build/contracts/SeafeedRegistry.json';
var sfaddr = "0xF662Bf150F7Fd04D96f18A8Bb7EAF16abDe64E92";
var sfinstance = utils.getContract("addr",sfaddr,provider,sfpath); // get the digitaltwin contract instance

router.post('/log/production',
    validator.check("productionid").exists().withMessage("Input should contain field 'productionid'."),
    validator.check("batchid").exists().withMessage("Input should contain field 'batchid'."),
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("volume").exists().withMessage("Input should contain field 'volume'."),
    validator.check("volume").isInt().withMessage("Input volume should be an integer."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productionid = request.body.productionid;
            var batchid = request.body.batchid;
            var farmid = request.body.farmid;
            var volume = request.body.volume;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logProduction(productionid,batchid,farmid,volume,datetime).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging production ${productionid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to log Production ${productionid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Production already exists.")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Production ID."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/log/testing',
    validator.check("testingid").exists().withMessage("Input should contain field 'testingid'."),
    validator.check("temperature").exists().withMessage("Input should contain field 'temperature'."),
    validator.check("temperature").isInt().withMessage("Input temperature should be an integer."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("productionid").exists().withMessage("Input should contain field 'productionid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var testingid = request.body.testingid;
            var temperature = request.body.temperature;
            var datetime = request.body.datetime;
            var productionid = request.body.productionid;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logTesting(testingid,temperature,datetime,productionid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging Testing ${testingid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to log Testing ${testingid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Testing already exists.")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Testing ID."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/log/storage',
    validator.check("storageid").exists().withMessage("Input should contain field 'storageid'."),
    validator.check("manufacturer").exists().withMessage("Input should contain field 'manufacturer'."),
    validator.check("location").exists().withMessage("Input should contain field 'location'."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("bestbefore").exists().withMessage("Input should contain field 'bestbefore'."),
    validator.check("testingid").exists().withMessage("Input should contain field 'testingid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var storageid = request.body.storageid;
            var manufacturer = request.body.manufacturer;
            var location = request.body.location;
            var datetime = request.body.datetime;
            var bestbefore = request.body.bestbefore;
            var testingid = request.body.testingid;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logStorage(storageid,manufacturer,location,datetime,bestbefore,testingid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging Storage ${storageid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to log Storage ${storageid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Storage already exists.")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Testing ID."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/log/saleorder',
    validator.check("orderid").exists().withMessage("Input should contain field 'orderid'."),
    validator.check("customer").exists().withMessage("Input should contain field 'customer'."),
    validator.check("customeraddr").exists().withMessage("Input should contain field 'customeraddr'."),
    validator.check("quantity").exists().withMessage("Input should contain field 'quantity'."),
    validator.check("quantity").isInt().withMessage("Input quantity should be an integer."),
    validator.check("datetime").exists().withMessage("Input should contain field 'datetime'."),
    validator.check("storageid").exists().withMessage("Input should contain field 'storageid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var orderid = request.body.orderid;
            var customer = request.body.customer;
            var customeraddr = request.body.customeraddr;
            var quantity = request.body.quantity;
            var datetime = request.body.datetime;
            var storageid = request.body.storageid;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.logSaleOrder(orderid,customer,customeraddr,quantity,datetime,storageid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging Order ${orderid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to log Order ${orderid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Order already exists.")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Order ID."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/update/saleorder',
    validator.check("orderid").exists().withMessage("Input should contain field 'orderid'."),
    validator.check("orderstatus").exists().withMessage("Input should contain field 'orderstatus'."),
    validator.check("orderstatus").isInt().withMessage("Input should be an integer in the range [0,3]."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var orderid = request.body.orderid;
            var orderstatus = request.body.orderstatus;
            var gas = request.body.gas;

            sfinstance.then(value => {
                value.methods.updateOrder(orderid,orderstatus).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Updating Order ${orderid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to update Order ${orderid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("gas")) {
                            response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                        } else if (error.message.includes("Order does not exist.")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing Order ID."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view/production', 
    validator.check("productionid").exists().withMessage("Input should contain field 'productionid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var productionid = request.query.productionid;

            sfinstance.then(value => {
                value.methods.queryProduction(productionid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"productionid":productionid,"batchid":result[0],"farmid":result[1],"volume":result[2],"datetime":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query Production ${productionid}.`);
                    console.log(error);

                    if (error.message.includes("Production does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Production does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/testing', 
    validator.check("testingid").exists().withMessage("Input should contain field 'testingid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var testingid = request.query.testingid;

            sfinstance.then(value => {
                value.methods.queryTesting(testingid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"testingid":testingid,"temperature":result[0],"datetime":result[1]});
                })
                .catch((error) => {
                    console.log(`Failed to query Testing ${testingid}.`);
                    console.log(error);

                    if (error.message.includes("Testing does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Testing does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/storage', 
    validator.check("storageid").exists().withMessage("Input should contain field 'storageid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var storageid = request.query.storageid;

            sfinstance.then(value => {
                value.methods.queryStorage(storageid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"storageid":storageid,"manufacturer":result[0],"location":result[1],"datetime":result[2],"bestbefore":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query Storage ${storageid}.`);
                    console.log(error);

                    if (error.message.includes("Storage does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Storage does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/saleorder', 
    validator.check("orderid").exists().withMessage("Input should contain field 'orderid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var orderid = request.query.orderid;

            sfinstance.then(value => {
                value.methods.querySaleOrder(orderid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"orderid":orderid,"customer":result[0],"customer blockchain address":result[1],"quantity":result[2],"orderstatus":result[3]});
                })
                .catch((error) => {
                    console.log(`Failed to query Order ${orderid}.`);
                    console.log(error);

                    if (error.message.includes("Order does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Order does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/saleorders',
    (request, response) => {
        sfinstance.then(value => {
            value.methods.queryAllSaleOrders().call({from: request.body.bcacc})
            .then((result) => {
                var order = {};
                var orderarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    order.orderid = result[0][i];
                    order.customer = result[1][i];
                    order.customeraddr = result[2][i];
                    order.quantity = result[3][i];
                    order.status = result[4][i];
                    order.datetime = result[5][i];
                    orderarray.push({...order});
                }
                console.log(orderarray);
                response.json(orderarray);
            })
            .catch((error) => {
                console.log("Failed to query all orders.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

router.get('/view/source', 
    validator.check("orderid").exists().withMessage("Input should contain field 'orderid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var orderid = request.query.orderid;

            sfinstance.then(value => {
                value.methods.querySaleOrderSource(orderid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"orderid":orderid,"productionid":result[0],"testingid":result[1],"storageid":result[2]});
                })
                .catch((error) => {
                    console.log(`Failed to query Order ${orderid}.`);
                    console.log(error);

                    if (error.message.includes("Order does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Order does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

module.exports=router;