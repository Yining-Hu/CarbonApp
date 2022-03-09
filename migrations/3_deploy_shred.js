const moz = artifacts.require('Moz');
const shred = artifacts.require('Shred');

module.exports = function(deployer){
    deployer.deploy(moz).then(function() {
        return deployer.deploy(shred, moz.address);
    });
};