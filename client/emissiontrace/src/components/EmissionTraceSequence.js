export default `
    sequenceDiagram
        autonumber
            actor Farmer
            actor FTS
            actor SF
            actor Beston
            actor Auditor
            participant Seafeed.sol
            participant FarmRegistry.sol
            participant AnimalRegistry.sol
            participant FeedTracking.sol
            participant EmissionTracking.sol
            participant CarbonToken.sol
            rect rgb(190, 150, 255)
            SF->>Seafeed.sol: Log seafeed productions, testings, storages, sales, orders.
            Farmer->>FarmRegistry.sol: Log farms.
            Farmer->>AnimalRegistry.sol: Log animals.
            Farmer->>FeedTracking.sol: Log feeds.
            FTS->>EmissionTracking.sol: Log emissions.
            end
            rect rgb(250, 150, 255)
            Beston->>CarbonToken.sol: Create carbon tokens.
            end
            rect rgb(255, 213, 128)
            Auditor->>CarbonToken.sol: Verify carbon tokens.
            Auditor->>Seafeed.sol: Verify seafeed records.
            Auditor->>FarmRegistry.sol: Verify farm details.
            Auditor->>AnimalRegistry.sol: Verify animal details.
            Auditor->>FeedTracking.sol: Verify feed records.
            Auditor->>EmissionTracking.sol: Verify emission records.
            end
`
