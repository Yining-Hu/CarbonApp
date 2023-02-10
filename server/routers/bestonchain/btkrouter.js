const utils = require('../../utils.js');
const fs = require('fs');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const express = require('express');
const validator = require('express-validator');
const router = express.Router();
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

var escrowpath = './build/contracts/Escrow.json';
var escrowaddr = "0xe42Afa755A516D0A10BEF19F912E8255f5198280";
var btkpath = './build/contracts/BToken.json';
var btkinstance = utils.getSubContract("addr",escrowaddr,provider,escrowpath,btkpath);

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

module.exports=router