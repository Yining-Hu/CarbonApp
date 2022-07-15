const BigNumber = require('bignumber.js');
const { default: Web3 } = require("web3");

const dt = artifacts.require("DigitalTwin");

contract('DigitalTwin', (accounts) => {
    var dtinstance;
    var seller = accounts[1];

    beforeEach('should setup the contract instance with the specified buyer and seller addresses', async () => {
        // constructor parameters are taken from the migration files
        dtinstance = await dt.deployed();
    });

    // mint 1st token on DigitalTwin.sol
    it("should mint the first token on DigitalTwin.sol and allow querying", async () => {
        var product1 = "doughnut";
        var metadata1 = "180g from ww bakery";
        await dtinstance.mint(product1, metadata1, {from: seller});
        
        var tkdetails;
        tkdetails = await dtinstance.queryToken(product1);
        assert.equal(tkdetails[1].toString(), metadata1);
        assert.equal(tkdetails[2].toString(), "pending verification"); // status of newly minted token should be PENDING
    })

    // mint 2nd token on DigitalTwin.sol
    it("should mint the second and third token on DigitalTwin.sol and allow querying all", async () => {
        var product2 = "bun";
        var metadata2 = "egg and chive";
        await dtinstance.mint(product2, metadata2, {from: seller});

        var product3 = "croissant";
        var metadata3 = "butter bread";
        await dtinstance.mint(product3, metadata3, {from: seller});
        
        var alltkdetails;
        alltkdetails = await dtinstance.queryAllFields();
        
        var tk = {};
        var tkarray = [];

        for (i=0;i<alltkdetails[0].length;i++) {
            tk.tkid = alltkdetails[0][i];
            tk.internal_id = alltkdetails[1][i];
            tk.datahash = alltkdetails[2][i];
            tk.verification_result = alltkdetails[3][i];
            tk.owner = alltkdetails[4][i];
            tkarray.push({...tk});
        }

        console.log(tkarray);
    })
})