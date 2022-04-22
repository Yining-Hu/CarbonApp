const dt = artifacts.require('DigitalTwin');

module.exports = function(deployer,network,accounts){
    deployer.deploy(dt, "MyTest Token", "MTest", {from:accounts[0]});
};