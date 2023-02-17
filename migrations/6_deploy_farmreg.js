const farm = artifacts.require('FarmRegistry');

module.exports = function(deployer,network,accounts) {
    deployer.deploy(farm, {gas: 5200000, from: accounts[0]});
};