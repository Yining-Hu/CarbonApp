const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

const privkeyPath = "server/credentials/bestonchain/";
const agentpath = privkeyPath + "agent.json";
const buyerpath = privkeyPath + "buyer.json";
const sellerpath = privkeyPath + "seller.json";

const agentkey = JSON.parse(fs.readFileSync(agentpath)).privkey;
const buyerkey = JSON.parse(fs.readFileSync(buyerpath)).privkey;
const sellerkey = JSON.parse(fs.readFileSync(sellerpath)).privkey;
const privKeys = [agentkey, buyerkey, sellerkey];

module.exports = {
  networks: {
    bestonchain: {
      // using localhost since connecting to the locally opearing node
      // else connect to http://125.63.52.142:8545
      provider: () => new HDWalletProvider(privKeys, "http://127.0.0.1:8545"),
      network_id: 100,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    ganache: {
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
