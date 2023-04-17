export default `
    sequenceDiagram;
        autonumber
            actor Buyer
            actor Seller
            actor Agent
            participant Escrow.sol
            participant DigitalTwin.sol
            rect rgb(190, 150, 255)
            Note right of DigitalTwin.sol: NFT minting
            Seller->>DigitalTwin.sol: Mint an HalalBox NFT for a box of halal meat.
            Seller->>Escrow.sol: Put the HalalBox on offer.
            end
            rect rgb(250, 150, 255)
            Note right of DigitalTwin.sol: Buyer deposits
            Buyer->>Escrow.sol: Make a deposit for HalalBox.
            activate Escrow.sol
            Note over Escrow.sol: This triggers the timer for seller to verify halal and redeem deposit.
            Escrow.sol-->>Agent: Pays agent fee.
            Escrow.sol-->>Seller: Pays the initial payment to seller.
            Note over Escrow.sol: Temporarily holds the remaining payment.
            end
            rect rgb(255, 213, 128)
            Note right of DigitalTwin.sol: DigiMarc Verification
            Seller->>DigitalTwin.sol: DigiMarc verification of the packaging.
            Buyer->>Escrow.sol: Access DigiMarc verification result, and update verification status.
            Escrow.sol-->>DigitalTwin.sol: Retrieve DigiMarc verification result.
            DigitalTwin.sol-->>Escrow.sol: 
            Escrow.sol-->>Buyer: 
            end
            rect rgb(191, 223, 255)
            Note right of DigitalTwin.sol: ML Verification
            Seller->>DigitalTwin.sol: ML verification of the box of halal meat.
            Buyer->>Escrow.sol: Access ML verification result, and update verification status.
            Escrow.sol-->>DigitalTwin.sol: Retrieve ML verification result.
            DigitalTwin.sol-->>Escrow.sol: 
            Escrow.sol-->>Buyer: 
            end
            rect rgb(200, 220, 50)
            Note right of DigitalTwin.sol: Payment settlement
            alt is halal
            Seller->>Escrow.sol: Redeem remaining payment before timeout.
            deactivate Escrow.sol
            else is not halal
            Buyer->>Escrow.sol: Claim refund after timeout.
            end
            end
`
