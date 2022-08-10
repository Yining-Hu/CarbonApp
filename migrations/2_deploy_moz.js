const moz = artifacts.require('Moz');

module.exports = function(deployer){
    deployer.deploy(moz, {gas: 5200000});
};