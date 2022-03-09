const _deploy_opal = require("../migrations/4_deploy_opal.js");
const truffleAssert = require('truffle-assertions');

var opal = artifacts.require("Opal");

contract('Opal', (accounts) => {
    var instance;
    var user1 = accounts[0];
    var user2 = accounts[1];

    beforeEach('should setup the contract instance', async () => {
        instance = await opal.deployed({from: user1});
    });

    it("should mint 2 new tokens", async() => {
        var name1 = "Boulder Opal";
        var metadata1 = "Color: Black";
        var name2 = "Light Opal";
        var metadata2 = "Color: Red";

        var tx = await instance.mint(name1, metadata1, {from: user1});
        await instance.mint(name2, metadata2, {from: user2});

        // test of events
        var { logs } = tx;
        var log = logs[1]; // the first is a transfer event (ERC721.sol)
        assert.equal(log.event, 'NewTokenMinted');
        assert.equal(log.args.tkname, name1);

        // check token ownership, supply
        var tokenbalance = await instance.balanceOf(user1);
        assert.equal(tokenbalance, 1);

        var tokenowner = await instance.ownerOf(2);
        assert.equal(tokenowner, user2);

        var totsupply = await instance.countToken();
        assert.equal(totsupply, 2);
    });

    // test of a failed mint
    it("should return an error", async() => {
        var name1 = "Boulder Opal";
        var metadata1 = "Color: Black";
        var err;
        var tx;

        try {
            tx = await instance.mint(name1, metadata1, {from: user2});
        } catch (ex) {
            err = ex;
        }

        assert.ok(!tx);
        assert.equal(err.reason, 'Token already exists.');
    });

    // test update
    it("should update an existing token with new metadata", async() => {
        var name = "Boulder Opal";
        var metadata2 = "Location: Melbourne";

        var tx = await instance.update(name, metadata2, {from: user1});
        var { logs } = tx;
        var log = logs[0];
        assert.equal(log.event, 'TokenUpdated');
        assert.equal(log.args.tkname, name);

        var newdata = await instance.queryToken(name);
        console.log(newdata);
        assert.equal(newdata, metadata2);
    });
    
});