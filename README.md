# Blockchain-Server
The repository contains a set of smart contracts and NodeJs APIs for access. The blockchain server running on Network Presence VPS is currently connected to a MyTest.sol contract on Polygon testnet. Server runs under the domain name ozirisblockchain.com.au, with both http and https options. Note that front-end users need to specify a gas value for sending a transaction on the blockchain.

## serverside/
A serverside application in NodeJs, with APIs for data access. Currently connected to a Moz.sol contract on Polygon testnet.
- To mint: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g","gas":400000}' -H "Content-Type: application/json" http://127.0.0.1:3000/mint
- To update: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g","gas":400000}' -H "Content-Type: application/json" http://127.0.0.1:3000/update
- To query: curl "http://127.0.0.1:3000/view?tkid=2022030401"

## clientside/
A decentralised browser application in JavaScript and HTML. Intended to allow direct access for clients with a blockchain wallet such as Metamask.