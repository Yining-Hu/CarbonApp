# Blockchain-Server
The repository contains a set of smart contracts and NodeJs APIs for access. The blockchain server running on Network Presence VPS is currently connected to a MyTest.sol contract on Polygon testnet. Server runs under the domain name ozirisblockchain.com.au, with both http and https options. Note that front-end users need to specify a gas value for sending a transaction on the blockchain.

## serverside/
A serverside application in NodeJs, with APIs for data access. Mainly for testing on local Ganache network.
- To mint: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g","gas":400000}' -H "Content-Type: application/json" http://127.0.0.1:3000/seller/mint
- To update: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g","gas":400000}' -H "Content-Type: application/json" http://127.0.0.1:3000/seller/update
- To query: curl "http://127.0.0.1:3000/view/token?tkid=2022030401"

# Escrow sequence diagram
Open sequence.html in browser for details.
