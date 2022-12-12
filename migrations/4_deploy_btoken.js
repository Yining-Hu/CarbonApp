const btk = artifacts.require('BToken');

module.exports = function(deployer,network,accounts){
    deployer.deploy(btk, 10000000000, {gas: 5200000, from:accounts[0]});
};