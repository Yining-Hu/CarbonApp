const herd = artifacts.require('HerdRegistry');
const project = artifacts.require('ProjectRegistry');

module.exports = function(deployer,network,accounts){
    deployer.deploy(project, herd.address, {gas: 5200000, from: accounts[4]});
};
