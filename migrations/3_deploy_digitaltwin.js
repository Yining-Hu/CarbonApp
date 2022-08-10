const dt = artifacts.require('DigitalTwin');

module.exports = function(deployer,network,accounts){
    deployer.deploy(dt, "MyNewTest Token", "MNT", {gas: 5200000, from:accounts[0]});
};