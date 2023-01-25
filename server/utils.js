const fs = require('fs');
const csv = require('csv-parser');
const keccak256 = require('keccak256');

const getWeb3 = (provider) => {
    const Web3 = require('web3');
    var web3 = new Web3(provider); // privnet

    return web3;
}

const getContract = async (type, param, provider, path) => {
    var Contract = require('web3-eth-contract');
    Contract.setProvider(provider);

    var rawContract = fs.readFileSync(path);
    var contractData = JSON.parse(rawContract);
    var abi = contractData.abi;
    var address;

    if (type == "netId") {
        address = contractData.networks[param].address;
    } else if (type == "addr") {
        address = param;
    } else {
        console.log("Input should be either netId or addr!");
    }

    var instance = await new Contract(abi, address);

    return instance;
};

// Todo: currently only specific to the btk() method, to generalise
// Note: type and param are for the initial contract
const getSubContract = async (type, param, provider, cpath, scpath) => {
    var Contract = require('web3-eth-contract');
    Contract.setProvider(provider);

    var rawContract = fs.readFileSync(cpath);
    var contractData = JSON.parse(rawContract);
    var abi = contractData.abi;

    if (type == "netId") {
        address = contractData.networks[param].address;
    } else if (type == "addr") {
        address = param;
    } else {
        console.log("Input should be either netId or addr!");
    }

    var instance = await new Contract(abi, address);
    var scaddr = await instance.methods.btk().call();
    var subinstance = await getContract("addr", scaddr, provider, scpath);

    return subinstance;
}

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

module.exports = {getWeb3, getContract, getSubContract, parseData, getData};