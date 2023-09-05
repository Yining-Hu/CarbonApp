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

var ftrackingpath = './build/contracts/FeedTracking.json';
var ftrackingaddr = "0xe778A92b0B57CCE976169a49cE55Cb5d9eAd4b17";
var ftrackinginstance = utils.getContract("addr",ftrackingaddr,provider,ftrackingpath); // get the digitaltwin contract instance

router.post('/log',
    validator.check("feedid").exists().withMessage("Input should contain field 'feedid'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'."),
    validator.check("feedtype").isInt().withMessage("Input should be an interger in the range [0,2]."),
    validator.check("orderid").exists().withMessage("Input should contain field 'orderid'"),
    validator.check("herdid").exists().withMessage("Input should contain field 'herdid'."),
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
            var orderid = request.body.orderid;
            var herdid = request.body.herdid;
            var dmi = request.body.dmi;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            ftrackinginstance.then(value => {
                value.methods.logFeed(feedid,feedtype,orderid,herdid,dmi,datetime).send({from: request.body.bcacc, gas: gas})
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
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new feed id for a registered herd."}));
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
                    response.json({"feedid":feedid,"feedtype":result[0],"herdid":result[1],"orderid":result[2],"dmi":result[3],"datetime":result[4]});
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

router.get('/view/feeds',
    (request, response) => {
        ftrackinginstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                var feed = {};
                var feedarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    feed.feedid = result[0][i];
                    feed.feedtype = result[1][i];
                    feed.claimstatus = result[2][i];
                    feed.herdid = result[3][i];
                    feed.orderid = result[4][i];
                    feed.dmi = result[5][i];
                    feed.datetime = result[6][i];
                    feedarray.push({...feed});
                }
                console.log(feedarray);
                response.json(feedarray);
            })
            .catch((error) => {
                console.log("Failed to query all feeds.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;