const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const privKeyBestonChain = ["6c5a32ce12b866ba6d658010b90960d51ff6f9a7da1510783e872dbab11433d2","6c5a32ce12b866ba6d658010b90960d51ff6f9a7da1510783e872dbab11433d2","c796465b8a824db6ab1317cb5b238e5912a718670ac44e3fa13f71996310fa2d"]

// get privkeys from files
// const agentpath = "server/bcprivkeys/agent.json";
// const buyerpath = "server/bcprivkeys/buyer.json";
// const sellerpath = "server/bcprivkeys/seller.json";
// const agentkey = JSON.parse(fs.readFileSync(agentpath)).privkey;
// const buyerkey = JSON.parse(fs.readFileSync(buyerpath)).privkey;
// const sellerkey = JSON.parse(fs.readFileSync(sellerpath)).privkey;
// const privKeyBestonChain = [agentkey,buyerkey,sellerkey];

module.exports = {
  networks: {
    bestonchain: {
      // provider: () => new HDWalletProvider(privKeyBestonChain, "http://125.63.52.142:8545"), // if connecting to VPS node1 to deploy
      provider: () => new HDWalletProvider(privKeyBestonChain, "http://127.0.0.1:8545"), // if connecting to Laptop node1 to deploy
      network_id: 100,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "5777",       // Any network (default: none)
    }
  },
  
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.7",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },

  db: {
    enabled: false
  }
};
