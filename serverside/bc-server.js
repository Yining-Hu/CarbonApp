const utils = require('./utils.js');
const express = require('express');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const keccak256 = require('keccak256')

const path = './build/contracts/DigitalTwin.json';
const escrowpath = './build/contracts/Escrow.json';

// choose a network based on command-line input
if (process.argv[2] == "--ganache") {
    const netId = '5777';
    const provider = 'http://127.0.0.1:7545';

    var instance = utils.getContract(netId,provider,path); // get the contract instance
    var escrowinstance = utils.getContract(netId,provider,escrowpath);

    // contract owner address on local ganache network
    var sender = "0x12947B8d2568DFf6396a25c0E9A062D5c7122D9C"
    var buyer = "0x877aDf99A29e69C8f4Bb22E2aeA4C7eCefb5Cf2c";
    var seller = "0x26eA7555392F9Cbc54c12D658B1A0a71CCBC2B9a";
} else if (process.argv[2] == "--mumbai") {
    const contractAddr = "0xd520A87dF49F00B25526F1F90a970871Ef897320"; 
    // Moz: "0xa4Df321308fB1c51Bb9d4c67Ea66064a54637D42"
    // HBox: "0xe81e9B89030bC8805FF54B752c0c6fAC6eCFcDd7"
    var sender = "0x8eB84f95e1199ea9eB1BD4b804911c4A392189a7"; // address on the mumbai network
    var senderPrivkey = "a419e6f435e1d8d48ae630979e5869b1ec0e81027acfe2cda9d0068650b5b00d";
    const provider = new HDWalletProvider(senderPrivkey, "https://rpc-mumbai.maticvigil.com");
    var instance = utils.getContractByAddr(contractAddr,provider,path); // get the contract instance
} else {
    console.log("Invalid network.");
}

var app = express();

app.use(express.json());

/*
 * routes for interacting with DigitalTwin.sol
 * To do: to add more fields in the mint route
 */
app.post('/seller/mint', function(request, response){
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

app.post('/seller/update', function(request, response){
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

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Token does not exist.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please enter an existing token name."}));
            } else if (error.message.includes("token owner")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Only the token owner can update the token."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

// seller uses this route to verify a product. status field of the request should be true or false
app.post('/seller/verify', function(request, response){
    var tkid = request.body.tkid;
    var gas = request.body.gas;
    var status = request.body.status;

    instance.then(value => {
        value.methods.verify(tkid,status).send({from: seller, gas: gas})
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

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Token does not exist.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please enter an existing token name."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.post('/seller/burn', function(request, response){
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

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Token does not exist.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please enter an existing token name."}));
            } else if (error.message.includes("token owner")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Only the token owner can update the token."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.get('/viewtoken', function(request, response){
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

            if (error.message.includes("Token does not exist.")) {
                response.write(JSON.stringify({"Server response":"Token does not exist."}));
            } else {
                response.write(JSON.stringify({"Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.get('/viewalltokens', function(request, response){
    instance.then(value => {
        value.methods.queryAll().call({from:sender})
        .then((result) => {
            console.log(result);
            response.json({"tokenids": result});
        })
        .catch((error) => {
            console.log("Failed to query all tokens");
            console.log(error);

            if (error.message.includes("contract owner")) {
                response.write(JSON.stringify({"Server response":"Only contract owner can query all tokens."}));
            } else {
                response.write(JSON.stringify({"Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

/*
 * routes for interacting with Escrow.sol 
 */

app.post('/seller/offerproduct',function(request, response) {
    var productid = request.body.productid;
    var price = request.body.price;
    var gas = request.body.gas;

    escrowinstance.then(value => {
        value.methods.offer(productid,price).send({from: seller, gas: gas})
        .then((result) => {
            console.log(result);
            console.log(`Listing new product: ${productid}, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to list product: ${productid}, Txn hash: ${txnhash}`);
            console.log(error);

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Product is already offered.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Please enter a new product name."}));
            } else if (error.message.includes("Product token is not minted.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Product token is not minted. Please mint token before offering."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.post('/buyer/deposit',function(request, response) {
    var productid = request.body.productid;
    var paymentvalue = request.body.paymentvalue;
    var gas = request.body.gas;

    escrowinstance.then(value => {
        value.methods.BuyerDeposit(productid).send({from: buyer, value: paymentvalue, gas: gas})
        .then((result) => {
            console.log(result);
            console.log(`Buyer sending deposit for product: ${productid}, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to send deposit for product: ${productid}, Txn hash: ${txnhash}`);
            console.log(error);

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("deposit")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Please make sure deposit covers both the product price and agent fee."}));
            } else if (error.message.includes("not on offer")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Please make sure the product is on offer and no deposit has been made."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.post('/seller/redeem',function(request, response) {
    var productid = request.body.productid;
    var gas = request.body.gas;

    escrowinstance.then(value => {
        value.methods.SellerRedeem(productid).send({from: seller, gas:gas})
        .then((result) => {
            console.log(result);
            console.log(`Transferring remaining payment of product: ${productid} to seller, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to transfer payment of product: ${productid}, Txn hash: ${txnhash}`);
            console.log(error);

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Product does not exist.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Please enter an existing product name."}));
            } else if (error.message.includes("deposit")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"No deposit found for this product."}));
            } else if (error.message.includes("unverified")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Seller cannot redeem payment of unverified product."}));
            } else if (error.message.includes("timeout")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Seller can only redeem before the specified timeout."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
})

app.post('/buyer/deny',function(request, response) {
    var productid = request.body.productid;
    var gas = request.body.gas;

    escrowinstance.then(value => {
        value.methods.BuyerDeny(productid).send({from: buyer, gas:gas})
        .then((result) => {
            console.log(result);
            console.log(`Transferring refund of product: ${productid} to buyer, Txn hash: ${result.transactionHash}`);
            response.write(JSON.stringify({"Txn":result.transactionHash, "Server response": "Txn successful."}));
            response.end('\n');
        })
        .catch((error) => {
            var txnhash = Object.keys(error.data)[0];
            console.log(`Failed to transfer refund of product: ${productid}, Txn hash: ${txnhash}`);
            console.log(error);

            if (error.message.includes("gas")) {
                response.write(JSON.stringify({"Txn":'0x', "Server response":"Txn unsuccessful. Please increase gas amount."}));
            } else if (error.message.includes("Product does not exist.")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Txn reverted. Please enter an existing product name."}));
            } else if (error.message.includes("deposit")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"No deposit found for this product."}));
            } else if (error.message.includes("timeout")) {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Buyer can only claim the return after the specified timeout."}));
            } else {
                response.write(JSON.stringify({"Txn":txnhash, "Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
})

// currently buyer uses this route to check the verification result of a product
// To do: to enable all participants to view
app.get('/viewverification',function(request, response) {
    var productid = request.query.productid;

    escrowinstance.then(value => {
        value.methods.VerifyProduct(productid).call({from: buyer})
        .then((result) => {
            console.log(result);
            console.log(`Verifying product identity: ${productid}`);
            response.write(JSON.stringify({"verification status": result}));
            response.end('\n');
        })
        .catch((error) => {
            console.log(`Failed to verify product: ${productid}`);
            console.log(error);

            if (error.message.includes("Product does not exist.")) {
                response.write(JSON.stringify({"Server response":"Txn reverted. Please enter an existing product name."}));
            } else {
                response.write(JSON.stringify({"Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
})

app.get('/viewproduct', function(request, response){
    var productid = request.query.productid;

    escrowinstance.then(value => {
        value.methods.QueryProduct(productid).call({from:buyer})
        .then((result) => {
            console.log(result);
            response.json({"productid": productid, "price": result[0], "escrow state": result[1], "verification":result[2]});
        })
        .catch((error) => {
            console.log(`Failed to query product: ${productid}`);
            console.log(error);

            if (error.message.includes("Product does not exist.")) {
                response.write(JSON.stringify({"Server response":"Product does not exist."}));
            } else {
                response.write(JSON.stringify({"Server response":"Please check transaction parameters."}));
            }
            response.end();
        })
    })
});

app.listen(3000);
