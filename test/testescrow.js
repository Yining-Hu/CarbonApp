const BigNumber = require('bignumber.js');
const { default: Web3 } = require("web3");
// const BN = web3.utils.BN;

const escrow = artifacts.require("Escrow");
const dt = artifacts.require("DigitalTwin");

contract('Escrow', (accounts) => {
    var escrowinstance;
    var dtinstance;
    // var agent = accounts[0];
    var users;
    var buyer;
    var seller;

    beforeEach('should setup the contract instance with the specified buyer and seller addresses', async () => {
        // constructor parameters are taken from the migration files
        escrowinstance = await escrow.deployed();
        dtinstance = await dt.deployed();

        users = await escrowinstance.GetUsers();
        buyer = users[1];
        seller = users[2];
        agent = users[0]
    });

    // firstly mint the token on DigitalTwin.sol
    it("should mint a token on DigitalTwin.sol and allow querying", async () => {
        var product = "doughnut";
        var metadata = "180g from ww bakery";
        await dtinstance.mint(product, metadata, {from: seller});
        
        var tkdetails;
        // tkdetails = await dtinstance.queryTokenFromContract(product);
        tkdetails = await dtinstance.queryToken(product);
        assert.equal(tkdetails[1].toString(), metadata);
        assert.equal(tkdetails[2].toString(), "pending verification"); // status of newly minted token should be PENDING
    })

    // secondly offer the product on Escrow.sol
    it("should offer the product on Escrow.sol", async () => {
        var product = "doughnut";
        var price = 30000;
        await escrowinstance.offer(product, price, {from: seller});
    });

    // should fail: offering without minting 
    it("should not offer a product without an existing product token", async () => {
        var product = "burger";
        var price = 70000;
        let err = null;

        try {
            await escrowinstance.offer(product, price, {from: seller});
        } catch (error) {
            err = error;
        }

        assert.ok(err instanceof Error);
    })

    // test of burn
    it("should put a false in tkExists for the burned token, remove the token from alltks", async () => {
        var product1 = "bread";
        var metadata1 = "30 hr recipe";

        await dtinstance.mint(product1, metadata1, {from: seller});
        await dtinstance.burn(product1, {from: seller});

        try {
            await dtinstance.queryToken(product1);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        var alltks = await dtinstance.queryAll();
        assert.deepEqual(alltks, ["doughnut"]);
    })

    // should fail: offering after burning 
    it("should not offer a product that has been burned", async () => {
        var product = "apple pie";
        var metadata = "home made";

        await dtinstance.mint(product, metadata, {from: seller});
        await dtinstance.burn(product, {from: seller});

        var price = 5678;

        try {
            await escrowinstance.offer(product, price, {from: seller});
        } catch (error) {
            err = error;
        }
        
        assert.ok(err instanceof Error);
    })

    // To do: should fail: burning after offering
    it("should not burn a product after it is offered", async () => {
        var product = "lemon";
        var metadata = "rich in vitamin c";
        var price = 7654;
        
        // mint the token
        await dtinstance.mint(product, metadata, {from: seller});
        var tkdetails1 = await dtinstance.queryToken(product);
        console.log(tkdetails1);

        // offer the product
        await escrowinstance.offer(product, price, {from: seller});
        var tkdetails2 = await dtinstance.queryToken(product);
        console.log(tkdetails2);

        // seller tries to burn the product, should fail
        try {
            await dtinstance.burn(product, {from: seller});
        } catch (error) {
            err = error;
        }

        assert.ok(err instanceof Error);
    })

    // thirdly the buyer makes a deposit for the product
    // escrowinstance.GetBalance(addr) returns BNs that I cannot parse
    // web3.eth.getBalance(addr) returns strings that I cannot parse
    // payments are successful
    it("should take the buyer's deposit, pay the agent fee, and send initial payment to seller", async () => {
        var product = "doughnut";
        var price = 30000;
        var fee = 100;

        await escrowinstance.BuyerDeposit(product, {from: buyer, value: price+fee});
    })

    // fourthly get the verification result (before ml verification)
    it("should return product details as false before ml verification", async () => {
        var product = "doughnut";

        // then query the product details 
        var result = await escrowinstance.QueryProduct(product);
        assert.equal(result[0], 30000);
        assert.equal(result[1].toString(), 1); //cannot use escrowinstance.EscrowState.DEPOSITTAKEN.toString()
        assert.equal(result[2], false);
    });

    // get the verification result (after ml verification)
    it("should return product details as true after ml verification", async () => {
        var product = "doughnut";

        // confirm verification result of product
        await dtinstance.verify(product, true, {from: agent});

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

        // seller redeem payment
        await escrowinstance.AgentApprove(product, {from: agent});

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
        await dtinstance.mint(product, metadata, {from: seller});

        // offer the coffee product
        await escrowinstance.offer(product, price, {from: seller});

        // buyer make a deposit
        await escrowinstance.BuyerDeposit(product, {from: buyer, value: price+fee});

        // deny the coffee product
        await dtinstance.verify(product, false, {from: agent});

        // utility function to set timeout
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await timeout(100000);

        // buyer deny the payment
        await escrowinstance.AgentDeny(product, {from: agent});

        // confirm that money gets returned to buyer and escrow state has changed
        var result = await escrowinstance.QueryProduct(product);
        assert.equal(result[1].toString(), 3);
    })

})