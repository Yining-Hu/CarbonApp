const utils = require('./utils.js');
const express = require('express');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const keccak256 = require('keccak256')

const path = './build/contracts/HalalBox.json';

// for local ganache network
// const netId = '5777';
// const provider = 'http://127.0.0.1:7545';
// var sender = "0xc34D8D91A7C50a03Dac50850E0C67C73CFB0268b"; // contract owner address on local ganache network
// var instance = utils.getContract(netId,provider,path); // get the contract instance

// for polygon mumbai
const contractAddr = "0xd520A87dF49F00B25526F1F90a970871Ef897320"; 
// Moz: "0xa4Df321308fB1c51Bb9d4c67Ea66064a54637D42"
// HBox: "0xe81e9B89030bC8805FF54B752c0c6fAC6eCFcDd7"
var sender = "0x8eB84f95e1199ea9eB1BD4b804911c4A392189a7"; // address on the mumbai network
var senderPrivkey = "a419e6f435e1d8d48ae630979e5869b1ec0e81027acfe2cda9d0068650b5b00d";
const provider = new HDWalletProvider(senderPrivkey, "https://rpc-mumbai.maticvigil.com");
var instance = utils.getContractByAddr(contractAddr,provider,path); // get the contract instance

var app = express();

app.use(express.json());

app.post('/mint', function(request, response){
    var tkid = request.body.tkid;
    var gas = request.body.gas;
    var gtin = request.body.GTIN;
    var weight = request.body.net_weight;
    var metadata = gtin + weight;
    var datahash = keccak256(metadata).toString('hex');

    instance.then(value => {
        value.methods.mint(tkid,datahash).send({from: sender, gas: gas})
        .then((result) => {
            console.log(result);
            console.log(`Minting new token: ${tkid}, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to mint token: ${tkid}, Txn hash: ${txnhash}`);
            console.log(error);

            // To do: return different error messages for different Txn revert reasons
            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Token already exists.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Please enter a new token name."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.post('/update', function(request, response){
    var tkid = request.body.tkid;
    var gas = request.body.gas;
    var gtin = request.body.GTIN;
    var weight = request.body.net_weight;
    var metadata = gtin + weight;
    var datahash = keccak256(metadata).toString('hex');

    instance.then(value => {
        value.methods.update(tkid,datahash).send({from: sender, gas: gas})
        .then((result) => {
            console.log(result);
            console.log(`Updating token details: ${tkid}, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to update token: ${tkid}, Txn hash: ${txnhash}`);
            console.log(error);

            // To do: return different error messages for different Txn revert reasons
            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please enter an existing token name."}));
            }
            response.end();
        })
    })
});

/**
 * status field of the request should be true or false
 */
app.post('/verify', function(request, response){
    var tkid = request.body.tkid;
    var gas = request.body.gas;
    var status = request.body.status;

    instance.then(value => {
        value.methods.verify(tkid,status).send({from: sender, gas: gas})
        .then((result) => {
            console.log(result);
            console.log(`Updating halal verification result: ${tkid}, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to verify token: ${tkid}, Txn hash: ${txnhash}`);
            console.log(error);

            // To do: return different error messages for different Txn revert reasons
            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please enter an existing token name."}));
            }
            response.end();
        })
    })
});

app.post('/burn', function(request, response){
    var tkid = request.body.tkid;
    var gas = request.body.gas;

    instance.then(value => {
        value.methods.burn(tkid).send({from: sender, gas: gas})
        .then((result) => {
            console.log(result);
            console.log(`Burning token: ${tkid}, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to burn token: ${tkid}, Txn hash: ${txnhash}`);
            console.log(error);

            // To do: return different error messages for different Txn revert reasons
            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please enter an existing token name."}));
            }
            response.end();
        })
    })
});

app.get('/view', function(request, response){
    var tkid = request.query.tkid;

    instance.then(value => {
        value.methods.queryToken(tkid).call({from:sender})
            .then((result) => {
            console.log(result);
            response.json({"tokenid": tkid, "internal id": result[0], "datahash": result[1], "verification result":result[2], "owner":result[3]});
        })
        .catch((error) => {
            console.log(`Failed to query token: ${tkid}`);
            console.log(error);

            // To do: return different error messages for different Txn revert reasons
            response.write(JSON.stringify({"Server response":"Token does not exist."}));
            response.end();
        })
    })
});

app.get('/viewall', function(request, response){
    instance.then(value => {
        value.methods.queryAll().call({from:sender})
            .then((result) => {
            console.log(result);
            response.json({"tokenids": result});
        })
        .catch((error) => {
            console.log("Failed to query all tokens");
            console.log(error);

            // To do: return different error messages for different Txn revert reasons
            response.write(JSON.stringify({"Server response":"Only contract owner can query all tokens."}));
            response.end();
        })
    })
});

app.listen(3000);
