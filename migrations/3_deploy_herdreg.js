const farm = artifacts.require('FarmRegistry');
const herd = artifacts.require('HerdRegistry');

module.exports = function(deployer,network,accounts){
    deployer.deploy(herd, farm.address, {gas: 5200000, from: accounts[4]});
};
