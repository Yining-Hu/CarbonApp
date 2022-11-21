const digitaltwin = artifacts.require('DigitalTwin');
const escrow = artifacts.require('Escrow');

module.exports = function(deployer,network,accounts){
    deployer.deploy(digitaltwin, "MyTest Token", "MTest",{gas: 5200000, from: accounts[0]}).then(function() {
        return deployer.deploy(escrow, digitaltwin.address, {gas: 5200000, from: accounts[0]});
    });
};