const utils = require('../../utils.js');
const fs = require('fs');
const express = require('express');
const validator = require('express-validator');
const router = express.Router();
router.use(express.json());

var netId = '5777';
var providerURL = 'http://127.0.0.1:7545';
var privkeyPath = "/home/yih/Documents/dev/beston-dapps/server/credentials/ganache/";

var btkpath = './build/contracts/BToken.json';
var btkinstance = utils.getContract(netId,providerURL,btkpath);

router.get('/balance', (request, response) => {
    var username = request.get('user-name');
    var user = JSON.parse(fs.readFileSync(privkeyPath+username+'.json'));
    var bcacc = user.bcacc;

    btkinstance.then(value => {
        value.methods.getBalance(bcacc).call({from: request.body.bcacc})
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
});

module.exports=router