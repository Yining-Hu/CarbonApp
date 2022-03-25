const utils = require('./utils.js');
const express = require('express');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const keccak256 = require('keccak256')

// const netId = '5777';
// const provider = 'http://127.0.0.1:7545';
const path = './build/contracts/Moz.json';
const defaultGas = 200000;
const contractAddr = "0xa4Df321308fB1c51Bb9d4c67Ea66064a54637D42";

// var sender = "0x409D2B42677A5f771fb46561CAb55Ed7B45fEFe3"; // address on the local ganache network
// var instance = utils.getContract(netId,provider,path); // get the contract instance
var sender = "0x8eB84f95e1199ea9eB1BD4b804911c4A392189a7"; // address on the mumbai network
var senderPrivkey = "a419e6f435e1d8d48ae630979e5869b1ec0e81027acfe2cda9d0068650b5b00d";
var provider = new HDWalletProvider(senderPrivkey, "https://rpc-mumbai.maticvigil.com");
var instance = utils.getContractByAddr(contractAddr,provider,path); // get the contract instance
var app = express();

app.use(express.json());

app.post('/mint', function(request, response){
    var tkid = request.body.tkid;
    var gtin = request.body.GTIN;
    var weight = request.body.net_weight;
    var metadata = gtin + weight;
    var datahash = keccak256(metadata).toString('hex');

    instance.then(value => {
        value.methods.mint(tkid,datahash).send({from: sender, gas: defaultGas})
        .on('transactionHash', function(transactionHash){
            console.log(`Minting new token: ${tkid}, Tx hash: ${transactionHash}`);
            response.write(JSON.stringify({'Tx id':transactionHash}));
            response.write('\n');
        })
        .on('error', function(error){
            console.log(error.message);
            response.write(JSON.stringify({"Server response":"Tx reverted. Please enter a new token name."}));
            response.end();
        })
        .on('receipt', function(receipt) {
            response.end();
        });
    });
});

app.post('/update', function(request, response){
    var tkid = request.body.tkid;
    var gtin = request.body.GTIN;
    var weight = request.body.net_weight;
    var metadata = gtin + weight;
    var datahash = keccak256(metadata).toString('hex');

    instance.then(value => {
        value.methods.update(tkid,datahash).send({from: sender, gas: defaultGas})
        .on('transactionHash', function(transactionHash){
            console.log(`Updating token details: ${tkid}, Tx hash: ${transactionHash}`);
            response.write(JSON.stringify({'Tx id':transactionHash}));
            response.write('\n');
        })
        .on('error', function(error){
            console.log(error.message);
            response.write(JSON.stringify({"Server response":"Tx reverted. Please enter an existing token name."}));
            response.end();
        })
        .on('receipt', function(receipt) {
            response.end();
        });
    });
});

app.get('/view', function(request, response){
    var tkid = request.query.tkid;

    instance.then(value => {
        value.methods.queryToken(tkid).call({from:sender}, function(error, metadata){
            if (error) {
                console.log("Error:", error.message);
                response.write(JSON.stringify({"Server response":"Tx reverted. Please enter an existing token name."}))
                response.end();
            } else {
                console.log("Query result:", metadata);
                response.json({tokenid: tkid, datahash: metadata});
            }
        })
    });
});

app.listen(3000);
