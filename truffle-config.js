const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
const privKey = "a419e6f435e1d8d48ae630979e5869b1ec0e81027acfe2cda9d0068650b5b00d";

module.exports = {

  networks: {

    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "5777",       // Any network (default: none)
    //  port: 8545,            // Standard Ethereum port (default: none)
    //  network_id: "18",       // Any network (default: none)
    },
    matic: {
      provider: () => new HDWalletProvider(privKey, "https://rpc-mumbai.maticvigil.com"),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
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
