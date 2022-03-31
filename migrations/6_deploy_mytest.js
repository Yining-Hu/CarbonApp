const mytest = artifacts.require('MyTest');

module.exports = function(deployer,network,accounts){
    deployer.deploy(mytest,{from:accounts[0]});
};