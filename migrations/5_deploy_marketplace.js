const digitaltwin = artifacts.require('DigitalTwin');
const marketplace = artifacts.require('MarketPlace');

// deploy as a dependency
module.exports = function(deployer,network,accounts){
    deployer.deploy(digitaltwin, "DigitalTwin", "DTwin",{gas: 5200000, from: accounts[0]}).then(function() {
        return deployer.deploy(marketplace, digitaltwin.address, {gas: 6700000, from: accounts[0]});
    });
};