const seafeed = artifacts.require('SeafeedRegistry');

module.exports = function(deployer,network,accounts){
    deployer.deploy(seafeed, {gas: 5200000, from: accounts[4]});
};