const utils = require('./utils.js');
const netId = '18';
const path = './build/contracts/Moz.json';

var instance = utils.getContract(netId,path); // get the contract instance

instance.then(value => {
    console.log("Total number of tokens minted is: ");
    value.methods.countToken().call().then(console.log);
})