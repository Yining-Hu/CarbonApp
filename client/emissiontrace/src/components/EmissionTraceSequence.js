export default `
    sequenceDiagram
        autonumber
            actor Farmer
            actor FTS
            actor SF
            actor Beston
            actor Auditor
            participant SeafeedRegistry.sol
            participant FarmRegistry.sol
            participant HerdRegistry.sol
            participant FeedTracking.sol
            participant EmissionTracking.sol
            participant CarbonToken.sol
            rect rgb(190, 150, 255)
            SF->>SeafeedRegistry.sol: Log seafeed productions, testings, storages, sales, orders.
            Farmer->>FarmRegistry.sol: Log farms.
            Farmer->>HerdRegistry.sol: Log herds.
            Farmer->>FeedTracking.sol: Log feeds.
            FTS->>EmissionTracking.sol: Log emissions.
            end
            rect rgb(250, 150, 255)
            Beston->>CarbonToken.sol: Create carbon tokens.
            end
            rect rgb(255, 213, 128)
            Auditor->>CarbonToken.sol: Verify carbon tokens.
            Auditor->>SeafeedRegistry.sol: Verify seafeed records.
            Auditor->>FarmRegistry.sol: Verify farm details.
            Auditor->>HerdRegistry.sol: Verify herd details.
            Auditor->>FeedTracking.sol: Verify feed records.
            Auditor->>EmissionTracking.sol: Verify emission records.
            end
`
