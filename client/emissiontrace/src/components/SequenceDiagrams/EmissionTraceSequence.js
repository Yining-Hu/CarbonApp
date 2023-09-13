const emissiontracesequence = `
%%{init: {'theme': 'forest', 'themeVariables': { 'fontSize': '20px'}}}%%
    sequenceDiagram
        autonumber
            actor Farmer
            actor Sensor Provider
            actor SF Producer
            actor Aggregator
            actor Auditor
            participant SeafeedRegistry
            participant ProjectRegistry
            participant FarmRegistry
            participant HerdRegistry
            participant FeedTracking
            participant EmissionTracking
            participant CarbonToken
            rect rgb(173, 216, 230)
            SF Producer->>SeafeedRegistry: Log seafeed productions, testings, storages, saleorders.
            Aggregator->>ProjectRegistry: Register projects, add herds to projects.
            Farmer->>FarmRegistry: Register farms.
            Farmer->>HerdRegistry: Register herds.
            Farmer->>FeedTracking: Log feeds.
            Sensor Provider->>EmissionTracking: Log emissions.
            end
            rect rgb(164, 190, 92)
            Aggregator->>CarbonToken: Create carbon tokens.
            end
            rect rgb(200, 150, 255)
            Auditor->>CarbonToken: Verify carbon tokens generations.
            Auditor->>SeafeedRegistry: Verify seafeed records.
            Auditor->>ProjectRegistry: Verify project details.
            Auditor->>FarmRegistry: Verify farm details.
            Auditor->>HerdRegistry: Verify herd details.
            Auditor->>FeedTracking: Verify feed records.
            Auditor->>EmissionTracking: Verify emission records.
            end
`

export default emissiontracesequence;