const farm = artifacts.require('FarmRegistry');
const cbt = artifacts.require('CarbonToken');

module.exports = function(deployer,network,accounts) {
    deployer.deploy(cbt, "Beston Carbon Token", farm.address, {gas: 5200000, from: accounts[0]});
};