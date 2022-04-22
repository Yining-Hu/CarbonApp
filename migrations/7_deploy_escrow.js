const escrow = artifacts.require('Escrow');

module.exports = function(deployer,network,accounts){
    deployer.deploy(escrow,accounts[1],accounts[2],{from:accounts[0]}); // initiate with buyer and seller addresses
};