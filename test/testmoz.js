const _deploy_moz = require("../migrations/2_deploy_moz.js");
const truffleAssert = require('truffle-assertions');

var moz = artifacts.require("Moz");

contract('Moz', (accounts) => {
    var instance;
    var user1 = accounts[0];
    var user2 = accounts[1];

    beforeEach('should setup the contract instance', async () => {
        instance = await moz.deployed({from: user1});
    });

    it("should mint 2 new tokens", async() => {
        var tokenid1 = "20220105";
        var metadata1 = "Location: Adelaide";
        var tokenid2 = "20220106";
        var metadata2 = "Location: Sydney";

        var value = await instance.mint(tokenid1, metadata1, {from: user1});
        await instance.mint(tokenid2, metadata2, {from: user2});

        // test of events
        var { logs } = value;
        var log = logs[1]; // the first is a transfer event (ERC721.sol)
        assert.equal(log.event, 'NewTokenMinted');
        assert.equal(log.args.tokenid, tokenid1);
        //console.log(log);

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
        var tokenid1 = "20220105";
        var metadata1 = "Location: Adelaide";
        var err;
        var tx;

        try {
            tx = await instance.mint(tokenid1, metadata1, {from: user2});
        } catch (ex) {
            err = ex;
        }

        assert.ok(!tx);
        assert.equal(err.reason, 'Token already exists.');
    });

    // test update
    it("should update an existing token with new metadata", async() => {
        var tokenid = "20220105";
        var metadata2 = "Location: Melbourne";

        var tx = await instance.update(tokenid, metadata2, {from: user1});

        var newdata = await instance.queryToken(tokenid);
        console.log(newdata);
        assert.equal(newdata, metadata2);

        // to do: check why the emitted event is different from NewTokenMinted
        // var { logs } = tx;
        // var log = logs[1];
        // assert.equal(log.event, 'TokenUpdated');
        // assert.equal(log.args.tokenid, tokenid);
    });
    
});