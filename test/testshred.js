const _deploy_moz = require("../migrations/2_deploy_moz.js");
const _deploy_mshred = require("../migrations/3_deploy_shred.js");
const truffleAssert = require('truffle-assertions');

var moz = artifacts.require("Moz");
var shred = artifacts.require("Shred");

contract('Shred', async (accounts) => {
    var instance;
    var mozInstance;

    var user1 = accounts[0];

    beforeEach('should setup the contract instance', async () => {
        instance = await shred.deployed({from: user1});
        mozInstance = await moz.deployed({from: user1});
    });

    // test of mint
    it("should mint 1 moz bar", async() => {
        //first mint a moz bar token
        var mozId = "20220105";
        var metadata1 = "low fat";

        await mozInstance.mint(mozId, metadata1, {from: user1});
        var mozbalance = await mozInstance.balanceOf(user1);
        assert.equal(mozbalance, 1);
    });

    // test of shred
    // to do: check msg.sender when calling function on Moz
    it("should burn 1 moz bar and create 10 bags of shredded moz", async() => {
        //first mint a moz bar token
        // var mozId = "20220105";
        var mozbalance, bagbalance;
        var mozBagIds = ["01051","01052","01053"];
        var metadata2 = ["shop1", "shop2", "shop3"];

        // to do: Only the token owner can destroy the token.
        await instance.shred(mozBagIds, metadata2, {from: user1});
        // mozbalance = await mozInstance.balanceOf(user1);
        // assert.equal(mozbalance, 0);

        bagbalance = await instance.balanceOf(user1);
        assert.equal(bagbalance, 3);

    });
});