const fs = require('fs');

const getWeb3 = async (provider) => {
    var Web3 = require('web3');
    var web3 = new Web3(provider); // privnet

    return web3;
}
  
const getContract = async (netId, provider, path) => {
    var Contract = require('web3-eth-contract');
    Contract.setProvider(provider);

    var rawContract = fs.readFileSync(path);
    var contractData = JSON.parse(rawContract);
    var abi = contractData.abi;
    var address = contractData.networks[netId].address;

    var instance = await new Contract(abi, address);

    return instance;
};

const getContractByAddr = async (address, provider, path) => {
  var Contract = require('web3-eth-contract');
  Contract.setProvider(provider);

  var rawContract = fs.readFileSync(path);
  var contractData = JSON.parse(rawContract);
  var abi = contractData.abi;

  var instance = await new Contract(abi, address);

  return instance;
};

module.exports = {getWeb3, getContract, getContractByAddr};