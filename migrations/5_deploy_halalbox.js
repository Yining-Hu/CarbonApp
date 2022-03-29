const halalbox = artifacts.require('HalalBox');

module.exports = function(deployer,network,accounts){
    deployer.deploy(halalbox,{from:accounts[0]});
};