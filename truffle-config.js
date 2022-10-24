const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
// const privKeyBestonChain = ["16e04e4441a5786f29ca78f65f331fa7a99d514aa8e698d49d4263cd8403704e","9201c575623ca41a815e7c79912dd93cf438498b580968298905eefc31c79326","70468f27978d713b18564667c50fe126a5ac243c3a19fd4557d669c4195404aa"]; // validator.key of beston-chain-1

// get privkeys from files
const agentpath = "server/bcprivkeys/agent.json";
const buyerpath = "server/bcprivkeys/buyer.json";
const sellerpath = "server/bcprivkeys/seller.json";
const agentkey = JSON.parse(fs.readFileSync(agentpath)).privkey;
const buyerkey = JSON.parse(fs.readFileSync(buyerpath)).privkey;
const sellerkey = JSON.parse(fs.readFileSync(sellerpath)).privkey;
const privKeyBestonChain = [agentkey,buyerkey,sellerkey];

module.exports = {
  networks: {
    bestonchain: {
      provider: () => new HDWalletProvider(privKeyBestonChain, "http://125.63.52.142:8545"),
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
