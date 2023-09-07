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

var projectregpath = './build/contracts/ProjectRegistry.json';
var projectregaddr = "0xB63BDB7246c63533309535aF5633244082b9bFeF";
var projectreginstance = utils.getContract("addr",projectregaddr,provider,projectregpath); // get the digitaltwin contract instance

router.post('/register', 
    validator.check("projectid").exists().withMessage("Input should contain field 'projectid'."),
    validator.check("baselinestart").exists().withMessage("Input should contain field 'baselinestart'."),
    validator.check("baselineend").exists().withMessage("Input should contain field 'baselineend'."),
    validator.check("projectstart").exists().withMessage("Input should contain field 'projectstart'."),
    validator.check("projectend").exists().withMessage("Input should contain field 'projectend'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var projectid = request.body.projectid;
            var baselinestart = request.body.baselinestart;
            var baselineend = request.body.baselineend;
            var projectstart = request.body.projectstart;
            var projectend = request.body.projectend;
            var gas = request.body.gas;

            projectreginstance.then(value => {
                value.methods.registerProject(projectid,baselinestart,baselineend,projectstart,projectend).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Registering a project: ${projectid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to register project: ${projectid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Transaction has been reverted")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new project id."}));
                        } else {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                        }
                    }
                    response.end();
                })
            })
        }
    })

router.post('/add/herds', 
    validator.check("projectid").exists().withMessage("Input should contain field 'projectid'."),
    validator.check("herdids").exists().withMessage("Input should contain field 'herdids'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var projectid = request.body.projectid;
            var herdids = request.body.herdids;
            var gas = request.body.gas;

            projectreginstance.then(value => {
                value.methods.addHerdsToProject(projectid,herdids).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Adding herds to project: ${projectid}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    if (error.receipt == null) {
                        console.log(error)
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        var txnhash = error.receipt.transactionHash;
                        console.log(`Failed to add herds to project: ${projectid}, Txn hash: ${txnhash}`);
                        console.log(error);

                        if (error.message.includes("Project does not exist")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing Project ID."}));
                        } else if (error.message.includes("Herd does not exist")) {
                            response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please only enter existing Herd IDs."}));
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
    validator.check("projectid").exists().withMessage("Input should contain field 'projectid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var projectid = request.query.projectid;

            projectreginstance.then(value => {
                value.methods.queryProject(projectid).call({from: request.body.bcacc})
                .then((result) => {
                    console.log(result);
                    response.json({"projectid": projectid, "baselinestart": result[0], "baselineend": result[1], "projectstart": result[2], "projectend": result[3], "herds":result[4]});
                })
                .catch((error) => {
                    console.log(`Failed to query project: ${projectid}`);
                    console.log(error);

                    if (error.message.includes("Project does not exist.")) {
                        response.write(JSON.stringify({"server_response":"Project does not exist."}));
                    } else {
                        response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/view/projects',
    (request, response) => {
        projectreginstance.then(value => {
            value.methods.queryAll().call({from: request.body.bcacc})
            .then((result) => {
                var project = {};
                var projectarray = [];
        
                for (i=0;i<result[0].length;i++) {
                    project.projectid = result[0][i];
                    project.baselinestart = result[1][i];
                    project.baselineend = result[2][i];
                    project.projectstart = result[3][i];
                    project.projectend = result[4][i];
                    // project.herds = result[5][i];
                    projectarray.push({...project});
                }
                console.log(projectarray);
                response.json(projectarray);
            })
            .catch((error) => {
                console.log("Failed to query all projects.");
                console.log(error);

                response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
                response.end();
            })
        })
    });

module.exports = router;