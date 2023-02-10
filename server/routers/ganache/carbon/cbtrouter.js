const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var cbtpath = './build/contracts/CarbonToken.json';
var cbtaddr = "0xcEdf3A40F0132e679Ca5938613cb495C3902d71e";
var cbtinstance = utils.getContract("addr",cbtaddr,provider,cbtpath);
// var cbtinstance = utils.getContract("netId",netId,providerURL,cbtpath);

router.post('/issue', 
    validator.check("id").exists().withMessage("Input should contain field 'id'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("start").exists().withMessage("Input should contain field 'start'."),
    validator.check("end").exists().withMessage("Input should contain field 'end'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var id = request.body.id;
            var amount = request.body.amount;
            var start = request.body.start;
            var end = request.body.end;
            var gas = request.body.gas;

            cbtinstance.then(value => {
                value.methods.issue(id,amount,start,end).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Issuing ${amount} amount of ${id} Carbon Tokens for the period ${start}-${end}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to issue ${id} Carbon Tokens, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Only admin")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only the Admin can issue carbon tokens."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to issue ${id} Carbon Tokens, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Only admin")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only the Admin can issue Carbon Tokens."}));
                    } else if (error.message.includes("does not exist")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please specify an already issued Carbon Token ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to udpate payment status of Distribution ${distributionid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Only admin")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only the Admin can update payment status."}));
                    } else if (error.message.includes("does not exist")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please specify an already issued Carbon Token ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view/cbtoken', 
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.query.cbtokenid;

            cbtinstance.then(value => {
                value.methods.queryDistribution(cbtokenid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"cbtokenid":cbtokenid,"internalid":result[0],"amount":result[1],"start_date":result[2],"end_date":result[3]});
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

module.exports = router;