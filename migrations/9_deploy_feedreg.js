const animal = artifacts.require('AnimalRegistry');
const seafeed = artifacts.require('Seafeed');
const feed = artifacts.require('FeedTracking');

module.exports = function(deployer,network,accounts){
    deployer.deploy(feed, animal.address, seafeed.address, {gas: 5200000, from: accounts[4]});
};