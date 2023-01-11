const dt = artifacts.require('DigitalTwin');

module.exports = function(deployer,network,accounts){
    deployer.deploy(dt, "DigitalTwin", "DTwin", {gas: 5200000, from:accounts[0]});
};