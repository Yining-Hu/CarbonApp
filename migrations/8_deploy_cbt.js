const farm = artifacts.require('FarmRegistry');
const project = artifacts.require('ProjectRegistry');
const feed = artifacts.require('FeedTracking');
const emission = artifacts.require('EmissionTracking');
const cbt = artifacts.require('CarbonToken');

module.exports = function(deployer,network,accounts) {
    deployer.deploy(cbt, "Beston Carbon Token", farm.address, project.address, feed.address, emission.address, {gas: 5200000, from: accounts[4]});
};