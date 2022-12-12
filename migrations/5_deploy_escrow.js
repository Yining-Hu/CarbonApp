const digitaltwin = artifacts.require('DigitalTwin');
const btoken = artifacts.require('BToken');
const escrow = artifacts.require('Escrow');

// deploy as separate contracts
module.exports = function(deployer,network,accounts){
    deployer.deploy(digitaltwin, "DigitalTwin", "DTwin",{gas: 5200000, from: accounts[0]});
    deployer.deploy(btoken, 10000000000,{gas: 5200000, from: accounts[0]});
    deployer.deploy(escrow, digitaltwin.address, btoken.address, 1, {gas: 5200000, from: accounts[0]});
};

// deploy as a dependency
// module.exports = function(deployer,network,accounts){
//     deployer.deploy(digitaltwin, "DigitalTwin", "DTwin",{gas: 5200000, from: accounts[0]}).then(function() {
//         return deployer.deploy(escrow, digitaltwin.address, {gas: 5200000, from: accounts[0]});
//     });
// };