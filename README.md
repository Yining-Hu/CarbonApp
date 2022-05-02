# Blockchain-Server
The repository contains a set of smart contracts and NodeJs APIs for access. The blockchain server running on Network Presence VPS is currently connected to a MyTest.sol contract on Polygon testnet. Server runs under the domain name ozirisblockchain.com.au, with both http and https options. Note that front-end users need to specify a gas value for sending a transaction on the blockchain.

## serverside/
A serverside application in NodeJs, with APIs for data access. Currently connected to a Moz.sol contract on Polygon testnet.
- To mint: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g","gas":400000}' -H "Content-Type: application/json" http://127.0.0.1:3000/mint
- To update: curl -d '{"tkid":"2022030401","GTIN":"576567567567","net_weight":"200g","gas":400000}' -H "Content-Type: application/json" http://127.0.0.1:3000/update
- To query: curl "http://127.0.0.1:3000/view?tkid=2022030401"

# Escrow sequence diagram
:::mermaid
sequenceDiagram;
autonumber
    participant Buyer
    participant Seller
    participant Escrow.sol
    participant DigitalTwin.sol
    Seller->>DigitalTwin.sol: Mint an HalalBox NFT for a box of halal meat.
    Seller->>Escrow.sol: Put the HalalBox on offer.
    Buyer->>Escrow.sol: Make a deposit for HalalBox.
    activate Escrow.sol
    Note right of Buyer: This triggers the timer for seller to verify halal and redeem deposit.
    Seller->>DigitalTwin.sol: ML verification of the box of halal meat.
    Escrow.sol-->>DigitalTwin.sol: Retrieve ML verification result.
    Buyer->>Escrow.sol: Access ML verification result, and update verification status.
    alt is halal
    Seller->>Escrow.sol: Redeem remaining payment before timeout.
    deactivate Escrow.sol
    else is not halal
    Buyer->>Escrow.sol: Claim refund after timeout.
    end
:::
