const utils = require('../../utils.js');
const fs = require('fs');
const express = require('express');
const validator = require('express-validator');
const router = express.Router();
router.use(express.json());

// var netId = '5777';
var provider = 'http://127.0.0.1:7545';
var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/ganache/";

var mppath = './build/contracts/MarketPlace.json';
var btkpath = './build/contracts/BToken.json';
var mpaddr = "0x9A248be12207FbBc9326ac17B8C2a1B1f3770Ed9";
var btkinstance = utils.getSubContract("addr",mpaddr,provider,mppath,btkpath);
// var btkinstance = utils.getSubContract("netId",netId,providerURL,mppath,btkpath);

router.post('/approve',
    validator.check("spender").exists().withMessage("Input should contain field 'spender'."),
    validator.check("amount").exists().withMessage("Input should contain field 'amount'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var spender = request.body.spender; 
            //Todo: if receipient is a string like "buyer", convert the string to their bcacc
            // var user = JSON.parse(fs.readFileSync(privkeyPath+request.body.spender+'.json'));
            // var spender = user.bcacc;
            
            var amount = request.body.amount;
            var gas = request.body.gas;

            btkinstance.then(value => {
                value.methods.approve(spender, amount).send({from: request.body.bcacc, gas: gas})
                .then((result) => {
                    console.log(result);
                    console.log(`Approved ${amount} BTK to be spent by ${spender}, Txn hash: ${result.transactionHash}`);
                    response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
                    response.end('\n');
                })
                .catch((error) => {
                    var txnhash = Object.keys(error.data)[0];
                    console.log(`Failed to approve ${amount} BTK to be spent by ${receipient}, Txn hash: ${txnhash}`);
                    console.log(error);

                    if (error.message.includes("gas")) {
                        response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
                    } else {
                        response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
                    }
                    response.end();
                })
            })
        }
    });

router.get('/balance', (request, response) => {
    var user = JSON.parse(fs.readFileSync(privkeyPath+request.get('user-name')+'.json'));
    var bcacc = user.bcacc;

    btkinstance.then(value => {
        value.methods.balanceOf(bcacc).call({from: request.body.bcacc})
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

// todo: consider removing the below routes
// router.post('/register',
//     validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
//     validator.check("gas").isInt(),

//     (request, response) => {

//         var paramerrors = validator.validationResult(request);
//         if (!paramerrors.isEmpty()) {
//             return response.status(400).json({"server_response": paramerrors.array()});
//         } else {
//             var user = JSON.parse(fs.readFileSync(privkeyPath+request.get('user-name')+'.json'));
//             var bcacc = user.bcacc;
//             var gas = request.body.gas;

//             btkinstance.then(value => {
//                 value.methods.registerUser(user, bcacc).send({from: request.body.bcacc, gas: gas})
//                 .then((result) => {
//                     console.log(result);
//                     console.log(`Registered ${user} on BTK, Txn hash: ${result.transactionHash}`);
//                     response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
//                     response.end('\n');
//                 })
//                 .catch((error) => {
//                     var txnhash = Object.keys(error.data)[0];
//                     console.log(`Failed to register ${user} on BTK, Txn hash: ${txnhash}`);
//                     console.log(error);

//                     if (error.message.includes("gas")) {
//                         response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
//                     } else if (error.message.includes("User already exists.")) {
//                         response.write(JSON.stringify({"Txn":txnhash, "server_response":"Txn reverted. Please enter a new token name."}));
//                     } else {
//                         response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
//                     }
//                     response.end();
//                 })
//             })
//         }
//     });

router.get('/balances', (request, response) => {
    btkinstance.then(value => {
        value.methods.queryAllBalances().call({from: request.body.bcacc})
        .then((result) => {
            var balance = {};
            var balancearray = [];
    
            for (i=0;i<result[0].length;i++) {
                balance.username = result[0][i];
                balance.balance = result[1][i];
                balancearray.push({...balance});
            }
            console.log(balancearray);
            response.json(balancearray);
        })
        .catch((error) => {
            console.log("Failed to query all balances");
            console.log(error);

            response.write(JSON.stringify({"server_response":"Please check transaction parameters."}));
            response.end();
        })
    })
});

module.exports=router