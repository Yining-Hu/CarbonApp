const digitaltwin = artifacts.require('DigitalTwin');
const escrow = artifacts.require('Escrow');

module.exports = function(deployer,network,accounts){
    // deployer.deploy(escrow,accounts[1],accounts[2],{from:accounts[0]}); // initiate with buyer and seller addresses

    deployer.deploy(digitaltwin, "MyTest Token", "MTest",{from: accounts[0]}).then(function() {
        return deployer.deploy(escrow, digitaltwin.address, accounts[1],accounts[2],{from: accounts[0]});
    });
};