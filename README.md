# Tokencontract
Deployed networks include: Ganache local test, Polygon Matic-Mumbai testnet.

## serverside/
A serverside application in NodeJs, with APIs for sharing data with other servers. Currently connected to a Moz.sol contract on Polygon testnet.
- Example for sending a GET request: curl "http://127.0.0.1:3001/view?tkid=2022030401"
- Example for sending a POST request: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g"}' -H "Content-Type: application/json" http://127.0.0.1:3000/

## clientside/
A decentralised browser application in JavaScript and HTML. Intended to allow direct access for clients with a blockchain wallet such as Metamask.