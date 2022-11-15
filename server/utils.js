const fs = require('fs');
const csv = require('csv-parser');
const keccak256 = require('keccak256');

const getWeb3 = (provider) => {
    const Web3 = require('web3');
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

function parseData(file) {
    let data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (row) => {
                var tokenid = row.tokenid; 
                var tokeninfo = row.tokeninfo;
                var sender = row.sender;
                var infohash = keccak256(tokeninfo).toString('hex');// hash tokeninfo and push to data
                data.push([tokenid, infohash, sender]);
            })
            .on('end', () => {
                resolve(data);
            });
    });
  }
  
async function getData(datapath) {
    try { 
        const data = await parseData(datapath);
        return data;
    } catch (error) {
        console.error("getData: An error occurred: ", error.message);
    }
}

module.exports = {getWeb3, getContract, getContractByAddr, parseData, getData};