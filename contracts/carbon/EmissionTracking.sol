// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./HerdRegistry.sol";

/**
 * Emission is by default CH4 
 */
contract EmissionTracking {
    HerdRegistry public herdregistry;

    struct EmissionRecord {
        uint256 herdID;
        uint256 amount;
        bool ccminted;
        address farmer;
        uint time;
        uint blocktime;
    }
    
    mapping(uint256 => EmissionRecord) public emissions;
    uint256 emissionCount;

    constructor(HerdRegistry _herdregistry)
    {
        herdregistry = _herdregistry;
    }

    function logEmission(uint256 _herdID, uint256 _amount, uint _time) public 
    {
        require(herdregistry.herdExists(_herdID), "Herd is not registed.");
        
        emissionCount++;
        emissions[emissionCount].herdID = _herdID;
        emissions[emissionCount].amount = _amount;
        emissions[emissionCount].ccminted = false;
        emissions[emissionCount].farmer = msg.sender;
        emissions[emissionCount].time = _time;
        emissions[emissionCount].blocktime = block.timestamp;
    }

    function viewEmission(uint256 _emissionID)
        public
        view 
        returns(
            uint256,
            uint256,
            bool,
            address,
            uint        ) {
            return(
                emissions[_emissionID].herdID,
                emissions[_emissionID].amount,
                emissions[_emissionID].ccminted,
                emissions[_emissionID].farmer,
                emissions[_emissionID].time
            );
        }

    function verifyEmission(uint256 _emissionID) public view returns (bool)
    {
        if (emissions[_emissionID].time < emissions[_emissionID].blocktime) {
            return(true);
        } else {
            return(false);
        }
    }
}