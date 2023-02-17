const animal = artifacts.require('AnimalRegistry');
const feed = artifacts.require('FeedTracking');

module.exports = function(deployer,network,accounts){
    deployer.deploy(feed, animal.address, {gas: 5200000, from: accounts[0]});
};