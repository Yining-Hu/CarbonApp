const BigNumber = require('bignumber.js');
const { default: Web3 } = require("web3");
// const BN = web3.utils.BN;

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
        // tkdetails = await dtinstance.queryTokenFromContract(product);
        tkdetails = await dtinstance.queryToken(product);
        assert.equal(tkdetails[1].toString(), metadata);
        assert.equal(tkdetails[2].toString(), "pending verification"); // status of newly minted token should be PENDING
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

    // fourthly get the verification result (before ml verification)
    it("should return product details", async () => {
        var product = "doughnut";

        // then query the product details 
        var result = await escrowinstance.QueryProduct(product);
        assert.equal(result[0], 30000);
        assert.equal(result[1].toString(), 1); //cannot use escrowinstance.EscrowState.DEPOSITTAKEN.toString()
        assert.equal(result[2], false);
    });

    // get the verification result (after ml verification)
    it("should return product details", async () => {
        var product = "doughnut";

        // confirm verification result of product
        await dtinstance.verify(product, true);

        // then query the product details 
        var result = await escrowinstance.QueryProduct(product);
        assert.equal(result[2], true);
    });

    // fifthly test of a successful trade
    it("should send the payment to the seller, and change the escrow status to PAYMENTSUCCESSFUL", async () => {
        var product = "doughnut";
        var seller_balance_before;
        var seller_balance_after;

        seller_balance_before = await web3.eth.getBalance(seller);
        // console.log(parseInt(seller_balance_before.toString()));

        // buyer approve payment
        await escrowinstance.BuyerApprove(product, {from: buyer});

        // confirm that payment has proceeded
        seller_balance_after = await web3.eth.getBalance(seller);

        // confirm the escrow state of the product
        var result = await escrowinstance.QueryProduct(product);
        assert.equal(result[1].toString(), 2);
    })

    // test of a failed trade
    it("should return the deposit to the buyer, and change the escrow state to PAYMENTREVERTED", async () => {
        var product = "coffee";
        var metadata = "decaf soy latte";
        var price = 45000;
        var fee = 100;
        
        // mint a coffee token
        await dtinstance.mint(product, metadata);

        // offer the coffee product
        await escrowinstance.offer(product, price, {from: seller});

        // buyer make a deposit
        await escrowinstance.BuyerSendPayment(product, {from: buyer, value: price+fee});

        // deny the coffee product
        await dtinstance.verify(product, false);

        // utility function to set timeout
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await timeout(100000);

        // buyer deny the payment
        await escrowinstance.BuyerDeny(product, {from: buyer});

        // confirm that money gets returned to buyer and escrow state has changed
        var result = await escrowinstance.QueryProduct(product);
        assert.equal(result[1].toString(), 3);
    })

})