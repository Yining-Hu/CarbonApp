// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AnimalRegistry.sol";
import "./FeedTracking.sol";

contract EmissionTracking {
    AnimalRegistry public animalregistry;
    FeedTracking public feedtracking;

    struct EmissionRecord {
        uint16 Value;
        FeedTracking.Ingredient FeedType;
        string AnimalID;
        uint256 DateTime; // unix time
        uint256 BlockTime;
    }
    
    mapping(string => EmissionRecord) public emissions;
    mapping(string => bool) public emissionExists;
    uint256 emissionCount;

    constructor(AnimalRegistry _animalregistry, FeedTracking _feedtracking)
    {
        animalregistry = _animalregistry;
        feedtracking = _feedtracking;
    }

    // Note: oziris should receive data as often as needed; blockchain will only receive data once/twice a day
    function logEmission(string memory _emissionid, uint16 _value, uint8 _feedtype, string memory _animalid, uint256 _datetime) public 
    {
        require(!emissionExists[_emissionid], "Emission ID exists.");
        require(animalregistry.animalExists(_animalid), "Animal is not registed.");
        
        emissionCount++;
        emissions[_emissionid] = EmissionRecord(_value, FeedTracking.Ingredient(_feedtype), _animalid, _datetime, block.timestamp);
    }

    function queryEmission(string memory _emissionid)
        public
        view 
        returns(
            string memory,
            uint16,
            string memory,
            uint256,
            uint256) 
        {
            require(emissionExists[_emissionid], "Emission ID does not exist.");
            string memory ingredient;

            if (emissions[_emissionid].FeedType == FeedTracking.Ingredient.REGULAR) {
                ingredient = "Regular";
            } else if (emissions[_emissionid].FeedType == FeedTracking.Ingredient.ASPARAGOPSIS) {
                ingredient = "Asparagopsis";
            } else if (emissions[_emissionid].FeedType == FeedTracking.Ingredient.POLYGAIN) {
                ingredient = "Polygain";
            } else {
                ingredient = "Unknown";
            }

            return(
                emissions[_emissionid].AnimalID,
                emissions[_emissionid].Value,
                ingredient,
                emissions[_emissionid].DateTime,
                emissions[_emissionid].BlockTime
            );
        }

    function verifyEmissionTime(string memory _emissionid) public view returns (bool)
    {
        require(emissionExists[_emissionid], "Emission ID does not exist.");
        if (emissions[_emissionid].DateTime < emissions[_emissionid].BlockTime) {
            return(true);
        } else {
            return(false);
        }
    }

    // Note: on the front end, for a record of issued Carbon Tokens, we first take the start and end date, then for each date we find the emission record
    // total emission has to be lower for the test group and higher for the controlled group
    // arg _control is an array of emission ids in the control group
    // arg _test is an array of emission ids in the test group
    function verifyEmissionValue(string[] memory _control, string[] memory _test) public returns(bool) {
        require(_control.length == _test.length, "Please supply same number of emission records for the control group and the test group.");
        uint16 controltotal = 0;
        uint16 testtotal = 0;

        for(uint256 i = 0; i <_control.length; i++){
            require(emissionExists[_control[i]], "Emission ID does not exist.");
            (string memory animalid,uint16 value,string memory ingredient,uint256 datetime,uint256 blocktime)=queryEmission(_control[i]);
            controltotal = controltotal + value;
        }

        for(uint256 i = 0; i <_test.length; i++){
            require(emissionExists[_test[i]], "Emission ID does not exist.");
            (string memory animalid,uint16 value,string memory ingredient,uint256 datetime,uint256 blocktime)=queryEmission(_test[i]);
            testtotal = testtotal + value;
        }

        return(controltotal > testtotal);
    }
}