// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "./AnimalRegistry.sol";
import "./HerdRegistry.sol";
import "./FeedTracking.sol";

contract EmissionTracking {
    // AnimalRegistry public animalregistry;
    HerdRegistry public herdregistry;
    FeedTracking public feedtracking;

    struct EmissionRecord {
        uint16 Value;
        FeedTracking.Ingredient FeedType;
        string HerdID;
        // string AnimalID;
        uint256 DateTime; // unix time
        uint256 BlockTime;
    }
    
    mapping(string => EmissionRecord) public emissions;
    mapping(string => bool) public emissionExists;
    string[] public allemissions;

    constructor(HerdRegistry _herdregistry, FeedTracking _feedtracking)
    {
        // animalregistry = _animalregistry;
        herdregistry = _herdregistry;
        feedtracking = _feedtracking;
    }

    // Note: oziris should receive data as often as needed; blockchain will only receive data once/twice a day
    function logEmission(string memory _emissionid, uint16 _value, uint8 _feedtype, string memory _herdid, uint256 _datetime) public 
    {
        require(!emissionExists[_emissionid], "Emission ID exists.");
        // require(animalregistry.animalExists(_animalid), "Animal is not registed.");
        require(herdregistry.herdExists(_herdid), "Herd does not exist.");
        
        emissions[_emissionid] = EmissionRecord(_value, FeedTracking.Ingredient(_feedtype), _herdid, _datetime, block.timestamp);
        emissionExists[_emissionid] = true;
        allemissions.push(_emissionid);
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
                // emissions[_emissionid].AnimalID,
                emissions[_emissionid].HerdID,
                emissions[_emissionid].Value,
                ingredient,
                emissions[_emissionid].DateTime,
                emissions[_emissionid].BlockTime
            );
        }

    function queryAll() public view 
    returns(
        string[] memory,
        string[] memory,
        uint16[] memory,
        string[] memory,
        uint256[] memory,
        uint256[] memory
    )
    {
        // string[] memory animalids = new string[](allemissions.length);
        string[] memory herdids = new string[](allemissions.length);
        uint16[] memory values = new uint16[](allemissions.length);
        string[] memory ingredients = new string[](allemissions.length);
        uint256[] memory datetimes = new uint256[](allemissions.length);
        uint256[] memory blocktimes = new uint256[](allemissions.length);

        for(uint256 i=0; i<allemissions.length; i++){
            // animalids[i] = emissions[allemissions[i]].AnimalID;
            herdids[i] = emissions[allemissions[i]].HerdID;
            values[i] = emissions[allemissions[i]].Value;

            if (emissions[allemissions[i]].FeedType == FeedTracking.Ingredient.REGULAR) {
                ingredients[i] = "Regular";
            } else if (emissions[allemissions[i]].FeedType == FeedTracking.Ingredient.ASPARAGOPSIS) {
                ingredients[i] = "Asparagopsis";
            } else if (emissions[allemissions[i]].FeedType == FeedTracking.Ingredient.POLYGAIN) {
                ingredients[i] = "Polygain";
            } else {
                ingredients[i] = "Unknown";
            }

            datetimes[i] = emissions[allemissions[i]].DateTime;
            blocktimes[i] = emissions[allemissions[i]].BlockTime;
        }

        return(allemissions,herdids,values,ingredients,datetimes,blocktimes);
    }

    // Note: on the front end, for a record of issued Carbon Tokens, we first take the start and end date, then for each date we find the emission record
    // total emission is expected to be lower for the treatment group and higher for the controlled group
    // arg _control is an array of emission ids in the control group
    // arg _treatment is an array of emission ids in the treatment group
    function verifyEmissionValue(string[] memory _control, string[] memory _treatment, uint8 _feedtype) public view returns(bool) {
        require(_control.length == _treatment.length, "Please supply same number of emission records for the control group and the test group.");
        uint16 controltotal = 0;
        uint16 treatmenttotal = 0;

        for(uint256 i=0; i<_control.length; i++){
            require(emissionExists[_control[i]], "Emission ID does not exist.");
            require(emissions[_control[i]].FeedType==FeedTracking.Ingredient.REGULAR, "Please only enter emission records with regular feed.");
            controltotal = controltotal + emissions[_control[i]].Value;

            require(emissionExists[_treatment[i]], "Emission ID does not exist.");
            require(emissions[_treatment[i]].FeedType==FeedTracking.Ingredient(_feedtype), "Please only enter emission records with the specified treatment type.");
            treatmenttotal = treatmenttotal + emissions[_treatment[i]].Value;
        }

        // same animal id shouldn't appear in both groups
        for(uint256 i=0; i<_control.length; i++){
            for(uint256 j=0; j<_treatment.length; j++){
                require(keccak256(abi.encodePacked(emissions[_treatment[j]].HerdID))!=keccak256(abi.encodePacked(emissions[_control[i]].HerdID)), "Control Group shouldn't have the same animals as Treatment Group.");
            }
        }

        return(controltotal > treatmenttotal);
    }

    // the function takes an Emission ID as an argument, returns the animalid and datetime, and find the corresponding feed record
    // it returns '' if the emission cannot be linked to a feed record
    // the frontend should propafate this
    function linkEmissionToFeed(string memory _emissionid) public returns(string memory) {
        string memory ingredient;
        string memory feedid;
        string memory feedsearchid;

        if (emissions[_emissionid].FeedType == FeedTracking.Ingredient.REGULAR) {
            ingredient = "Regular";
        } else if (emissions[_emissionid].FeedType == FeedTracking.Ingredient.ASPARAGOPSIS) {
            ingredient = "Asparagopsis";
        } else if (emissions[_emissionid].FeedType == FeedTracking.Ingredient.POLYGAIN) {
            ingredient = "Polygain";
        } else {
            ingredient = "Unknown";
        }

        feedsearchid = string(abi.encodePacked(ingredient,emissions[_emissionid].HerdID,emissions[_emissionid].DateTime));
        feedid = feedtracking.feedSearch(feedsearchid);

        return(feedid);
    }
}