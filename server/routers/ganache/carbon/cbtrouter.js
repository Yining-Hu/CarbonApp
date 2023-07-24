const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var cbtpath = './build/contracts/CarbonToken.json';
var cbtaddr = "0x0ABCB8C9FFD56C932E836213158287f6E5C53384";
var cbtinstance = utils.getContract("addr",cbtaddr,provider,cbtpath);
// var cbtinstance = utils.getContract("netId",netId,providerURL,cbtpath);

router.post('/issue',
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("feedids").exists().withMessage("Input should contain field 'feedids'."),
    validator.check("projectid").exists().withMessage("Input should contain field 'projectid'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.body.cbtokenid;
            var amount = request.body.amount;
            var feedids = request.body.feedids;
            var projectid = request.body.projectid;
            var gas = request.body.gas;

            cbtinstance.then(value => {
                value.methods.issue(cbtokenid,amount,feedids,projectid).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Issuing ${amount} amount of ${cbtokenid} Carbon Tokens for the project ${projectid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to issue ${cbtokenid} Carbon Tokens, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Only admin")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Only the Admin can issue carbon tokens."}));
                    } else if (error.message.includes("already exists")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new carbon token id."}));
                    } else if (error.message.includes("ERC1155")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please specify a valid address for minting to."}));
                    } else if (error.message.includes("does not exist")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please using existing feed ids."}));
                    } else if (error.message.includes("already claimed")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please only use unclaimed feed records."}));
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
                    console.log(`Failed to distribute Carbon Token ${cbtokenid}, Txn hash: ${txnhash}`);
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

router.get('/balance',
    validator.check("internalid").exists().withMessage("Input should contain field 'internalid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var internalid = request.query.internalid;

            cbtinstance.then(value => {
                value.methods.balanceOf(request.body.bcacc, internalid).call()
                .then((result) => {
                    console.log(result);
                    response.json({"balance":result});
                })
                .catch((error) => {
                    console.log(`Failed to get balance of account ${request.body.bcacc}.`);
                    console.log(error);

                    if (error.message.includes("ERC1155")) {
                        response.write(JSON.stringify({"server_response":"Please specify a valid user."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/cbtoken',
    validator.check("cbtokenid").exists().withMessage("Input should contain field 'cbtokenid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var cbtokenid = request.query.cbtokenid;

            cbtinstance.then(value => {
                value.methods.queryCarbonToken(cbtokenid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"cbtokenid":cbtokenid,"projectid":result[0],"internalid":result[1],"amount":result[2]});
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

router.get('/view/cbtokens',
    (request, response) => {
        cbtinstance.then(value => {
            value.methods.queryAllCarbonToken().call({from: request.body.bcacc})
            .then((result) => {
                var cbt = {};
                var cbtarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    cbt.cbtokenid = result[0][i];
                    cbt.projectid = result[1][i];
                    cbt.internalid = result[2][i];
                    cbt.amount = result[3][i];
                    cbtarray.push({...cbt});
                }
                console.log(cbtarray);
                response.json(cbtarray);
            })
            .catch((error) => {
                console.log("Failed to query all cbtokens.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
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

router.get('/view/distributions',
    (request, response) => {
        cbtinstance.then(value => {
            value.methods.queryAllDistribution().call({from: request.body.bcacc})
            .then((result) => {
                var distribution = {};
                var distributionarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    distribution.distributionid = result[0][i];
                    distribution.cbtokenid = result[1][i];
                    distribution.amount = result[2][i];
                    distribution.farmer = result[3][i];
                    distribution.paid = result[4][i];
                    distributionarray.push({...distribution});
                }
                console.log(distributionarray);
                response.json(distributionarray);
            })
            .catch((error) => {
                console.log("Failed to query all distributions.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;