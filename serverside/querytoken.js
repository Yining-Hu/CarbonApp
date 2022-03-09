const utils = require('./utils.js');
const netId = '18';
const path = './build/contracts/Moz.json';
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var instance = utils.getContract(netId,path); // get the contract instance

instance.then(value => {
    rl.question("Please enter the token id: ", function(token) {
        value.methods.queryToken(token).call().then(console.log);
        rl.close();
    })
})