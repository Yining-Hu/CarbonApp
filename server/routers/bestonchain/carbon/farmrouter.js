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

var farmregpath = './build/contracts/FarmRegistry.json';
var farmregaddr = "0x5030ccc29FCf1878165cE3f8da157aeF57c59899";
var farmreginstance = utils.getContract("addr",farmregaddr,provider,farmregpath); // get the digitaltwin contract instance

router.post('/register', 
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var farmid = request.body.farmid;
            var gas = request.body.gas;

            farmreginstance.then(value => {
                value.methods.registerFarm(farmid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Registering a farm: ${farmid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to register farm: ${farmid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new farm name."}));
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
    validator.check("farmid").exists().withMessage("Input should contain field 'farmid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var farmid = request.query.farmid;

            farmreginstance.then(value => {
                value.methods.queryFarm(farmid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"farmid": farmid, "farmer": result[0]});
                })
                .catch((error) => {
                    console.log(`Failed to query farm: ${farmid}`);
                    console.log(error);

                    if (error.message.includes("Farm does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Farm does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/farms',
    (request, response) => {
        farmreginstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                var farm = {};
                var farmarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    farm.farmid = result[0][i];
                    farm.farmer = result[1][i];
                    farmarray.push({...farm});
                }
                console.log(farmarray);
                response.json(farmarray);
            })
            .catch((error) => {
                console.log("Failed to query all farms.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;