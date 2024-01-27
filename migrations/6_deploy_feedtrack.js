const herd = artifacts.require('HerdRegistry');
const seafeed = artifacts.require('SeafeedRegistry');
const feed = artifacts.require('FeedTracking');

module.exports = function(deployer,network,accounts){
    deployer.deploy(feed, herd.address, seafeed.address, {gas: 5200000, from: accounts[4]});
};