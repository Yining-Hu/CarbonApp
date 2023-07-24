const utils = require('../../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router();
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';

var herdregpath = './build/contracts/ProjectRegistry.json';
var herdregaddr = "";
var projectreginstance = utils.getContract("addr",herdregaddr,provider,herdregpath);
// var projectreginstance = utils.getContract("netId",netId,providerURL,herdregpath);

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
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to register project: ${projectid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Herd already exists")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new Herd ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
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
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to add herds to project: ${projectid}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else if (error.message.includes("Project does not exists")) {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter an existing Project ID."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    })

router.get('/view', 
    validator.check("herdid").exists().withMessage("Input should contain field 'herdid'."),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var herdid = request.query.herdid;

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
                    project.herds = result[5][i];
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