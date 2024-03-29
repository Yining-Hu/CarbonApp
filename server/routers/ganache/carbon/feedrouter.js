const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var ftrackingpath = './build/contracts/FeedTracking.json';
var ftrackingaddr = "0xF17a5701695F71077D28789e47eD091C795BDB1a";
var ftrackinginstance = utils.getContract("addr",ftrackingaddr,provider,ftrackingpath);

router.post('/log',
    validator.check("feedid").exists().withMessage("Input should contain field 'feedid'."),
    validator.check("feedtype").exists().withMessage("Input should contain field 'feedtype'."),
    validator.check("feedtype").isInt().withMessage("Input should be an interger in the range [0,2]."),
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
            var herdid = request.body.herdid;
            var dmi = request.body.dmi;
            var datetime = request.body.datetime;
            var gas = request.body.gas;

            ftrackinginstance.then(value => {
                value.methods.logFeed(feedid,feedtype,herdid,dmi,datetime).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Logging feed ${feedid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to log feed ${feedid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Feed ID already exists.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Feed ID."}));
                    } else if (error.message.includes("Herd is not registered.")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. You can only log feed for a registered herd."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                    feed.herdid = result[2][i];
                    feed.orderid = result[3][i];
                    feed.dmi = result[4][i];
                    feed.datetime = result[5][i];
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

module.exports=router;