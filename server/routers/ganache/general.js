const utils = require('../../utils.js');
const express = require('express');
const validator = require('express-validator');
const router = express.Router()
router.use(express.json());

var providerURL = 'http://127.0.0.1:7545';
var web3 = utils.getWeb3(providerURL);

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

module.exports=router