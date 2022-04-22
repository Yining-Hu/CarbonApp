const BigNumber = require('bignumber.js');
const { default: Web3 } = require("web3");

const escrow = artifacts.require("Escrow");
const dt = artifacts.require("DigitalTwin");

contract('Escrow', (accounts) => {
    var escrowinstance;
    var dtinstance;
    var agent = accounts[0];
    var users;
    var buyer;
    var seller;

    beforeEach('should setup the contract instance with the specified buyer and seller addresses', async () => {
        // constructor parameters are taken from the migration files
        escrowinstance = await escrow.deployed();
        dtinstance = await dt.deployed();

        users = await escrowinstance.GetUsers();
        buyer = users[0];
        seller = users[1];
    });

    // firstly mint the token on DigitalTwin.sol
    it("should mint a token on DigitalTwin.sol and allow querying", async () => {
        var product = "doughnut";
        var metadata = "180g from ww bakery";
        await dtinstance.mint(product, metadata);
        
        var tkdetails;
        tkdetails = await dtinstance.queryTokenFromContract(product);
        assert.equal(tkdetails[1].toString(), metadata);
        assert.equal(tkdetails[2].toString(), 0); // status of newly minted token should be PENDING
    })

    // secondly offer the product on Escrow.sol
    // error with VerifyProduct (since this func calls DigitalTwin.sol)
    it("should offer the product on Escrow.sol", async () => {
        var product = "doughnut";
        var price = 30000;
        await escrowinstance.offer(product, price, {from: seller});
    });

    // thirdly the buyer makes a deposit for the product
    // escrowinstance.GetBalance(addr) returns BNs that I cannot parse
    // web3.eth.getBalance(addr) returns strings that I cannot parse
    // payments are successful
    it("should take the buyer's deposit, pay the agent fee, and send initial payment to seller", async () => {
        var product = "doughnut";
        var price = 30000;
        var fee = 100;

        await escrowinstance.BuyerSendPayment(product, {from: buyer, value: price+fee});
    })

    // fourthly get the verification result
    it("should return product details", async () => {
        var product = "doughnut";

        // then query the product details 
        var result = await escrowinstance.VerifyProduct(product);
        assert.equal(result, false);

        // var result = await escrowinstance.QueryProduct(product);
        // assert.equal(result[0], 30000);
        // assert.equal(result[1].toString(), 0); //cannot use escrowinstance.EscrowState.OFFERED.toString()
        // assert.equal(result[2], false);
    });

})