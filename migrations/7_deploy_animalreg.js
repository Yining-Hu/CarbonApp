const farm = artifacts.require('FarmRegistry');
const animal = artifacts.require('AnimalRegistry');

module.exports = function(deployer,network,accounts){
    deployer.deploy(animal, farm.address, {gas: 5200000, from: accounts[0]});
};
