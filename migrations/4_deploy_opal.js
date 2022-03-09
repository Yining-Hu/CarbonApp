const opal = artifacts.require('Opal');

module.exports = function(deployer,network,accounts){
    deployer.deploy(opal,{from:accounts[1]});
};