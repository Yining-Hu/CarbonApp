const utils = require('./utils.js');

const netId = '18';
const provider = 'http://127.0.0.1:7545';
const path = './build/contracts/Moz.json';
const defaultGas = 400000;
const datafile = "./client-js/data.csv";

var instance = utils.getContract(netId,provider,path); // get the contract instance

const txdata = utils.getData(datafile);
txdata.then(tx => {
  tx.forEach(element => {
    instance.then(value => {
      value.methods.mint(element[0],element[1]).send({from: element[2], gas: defaultGas}).then(() => {
        console.log("New token minted:", `${element[0]} - ${element[1]}`);
      });
    })
  });
})