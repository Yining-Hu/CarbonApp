const farm = artifacts.require('FarmRegistry');
const cbt = artifacts.require('CarbonToken');

module.exports = function(deployer,network,accounts) {
    deployer.deploy(farm, {gas: 5200000, from: accounts[0]}).then(function() {
        // Todo: can change the string to a url
        return deployer.deploy(cbt, "Beston Carbon Token", farm.address, {gas: 5200000, from: accounts[0]});
    });
};