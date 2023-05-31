const animal = artifacts.require('AnimalRegistry');
const feed = artifacts.require('FeedTracking');
const emission = artifacts.require('EmissionTracking');

module.exports = function(deployer,network,accounts){
    deployer.deploy(emission, animal.address, feed.address, {gas: 5200000, from: accounts[4]});
};