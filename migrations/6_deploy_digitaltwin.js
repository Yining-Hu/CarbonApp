const dt = artifacts.require('DigitalTwin');

module.exports = function(deployer,network,accounts){
    deployer.deploy(dt, "MyNewTest Token", "MNT", {from:accounts[0]});
};