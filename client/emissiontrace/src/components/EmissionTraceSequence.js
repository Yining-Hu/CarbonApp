export default `
%%{init: {'theme': 'forest', 'themeVariables': { 'fontSize': '20px'}}}%%
    sequenceDiagram
        autonumber
            actor Farmer
            actor Methane Sensor Provider
            actor Seafeed Producer
            actor Aggregator
            actor Auditor
            participant SeafeedRegistry.sol
            participant ProjectRegistry.sol
            participant FarmRegistry.sol
            participant HerdRegistry.sol
            participant FeedTracking.sol
            participant EmissionTracking.sol
            participant CarbonToken.sol
            rect rgb(173, 216, 230)
            Seafeed Producer->>SeafeedRegistry.sol: Log seafeed productions, testings, storages, saleorders.
            Aggregator->>ProjectRegistry.sol: Register projects, add herds to projects.
            Farmer->>FarmRegistry.sol: Register farms.
            Farmer->>HerdRegistry.sol: Register herds.
            Farmer->>FeedTracking.sol: Log feeds.
            Methane Sensor Provider->>EmissionTracking.sol: Log emissions.
            end
            rect rgb(164, 190, 92)
            Aggregator->>CarbonToken.sol: Create carbon tokens.
            end
            rect rgb(200, 150, 255)
            Auditor->>CarbonToken.sol: Verify carbon tokens generations.
            Auditor->>SeafeedRegistry.sol: Verify seafeed records.
            Auditor->>ProjectRegistry.sol: Verify project details.
            Auditor->>FarmRegistry.sol: Verify farm details.
            Auditor->>HerdRegistry.sol: Verify herd details.
            Auditor->>FeedTracking.sol: Verify feed records.
            Auditor->>EmissionTracking.sol: Verify emission records.
            end
`