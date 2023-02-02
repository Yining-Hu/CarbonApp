const utils = require('../../utils.js');
const fs = require('fs'); 
const HDWalletProvider = require("@truffle/hdwallet-provider");
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
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
var web3 = utils.getWeb3(provider);

router.post('/transfer', 
    validator.check("sender").exists().withMessage("Input should contain field 'sender'."),
    validator.check("receiver").exists().withMessage("Input should contain field 'receiver'."),
    validator.check("value").exists().withMessage("Input should contain field 'value'."),
    validator.check("privkey").exists().withMessage("Input should contain field 'privkey'."),
    validator.check("gas").exists().withMessage("Input should contain field 'gas'."),
    validator.check("gas").isInt(),

    (request, response) => {
        var sender = request.body.sender;
        var privkey = request.body.privkey;
        var receiver = request.body.receiver;
        var value = request.body.value;
        var gas = request.body.gas;
        
        web3.eth.sendTransaction({from: sender, to: receiver, value: value, gas: gas}, privkey)
        .then((result) => {
            console.log(`Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "server_response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            console.log(error);
            var txnhash = Object.keys(error.data)[0];
            console.log(`Txn hash: ${txnhash}`);

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "server_response":"Txn unsuccessful. Please increase gas amount."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "server_response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })

router.get('/balance', (request, response) => {
    var username = request.get('user-name');
    var user = JSON.parse(fs.readFileSync(privkeyPath+username+'.json'));
    var bcacc = user.bcacc;

    web3.eth.getBalance(bcacc)
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

module.exports=router