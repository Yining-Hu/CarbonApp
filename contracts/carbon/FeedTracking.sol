// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AnimalRegistry.sol";

contract FeedTracking {
    AnimalRegistry public animalregistry;

    enum Ingredient {
        REGULAR,
        ASPARAGOPSIS,
        POLYGAIN
    }

    enum ClaimStatus {
        CLAIMED,
        UNCLAIMED
    }

    struct FeedRecord {
        Ingredient FeedType;
        ClaimStatus Status;
        string AnimalID;
        uint16 DMI;
        uint256 DateTime;
        uint256 BlockTime;
    }

    mapping(string => FeedRecord) public feeds;
    mapping(string => bool) public feedExists;
    mapping(string => string) public feedSearch;
    mapping(string => bool) public feedClaimed; // value changes to true if a feed record has been used to claim carbon tokens.

    constructor(AnimalRegistry _animalregistry)
    {
        animalregistry = _animalregistry;
    }

    /**
     * ingredient Regular-0, Asparagopsis-1, Polygain-2
     */
    function logFeed(string memory _feedid, uint8 _feedtype, string memory _animalid, uint16 _dmi, uint256 _datetime) public 
    {
        require(!feedExists[_feedid], "Feed ID already exist.");
        require(animalregistry.animalExists(_animalid), "Animal is not registed.");
        
        string memory searchid;
        string memory ingredient;

        feeds[_feedid] = FeedRecord(Ingredient(_feedtype), ClaimStatus.UNCLAIMED, _animalid, _dmi, _datetime, block.timestamp);
        feedExists[_feedid] = true;

        if (Ingredient(_feedtype) == Ingredient.REGULAR) {
            ingredient = "Regular";
        } else if (Ingredient(_feedtype) == Ingredient.ASPARAGOPSIS) {
            ingredient = "Asparagopsis";
        } else if (Ingredient(_feedtype) == Ingredient.POLYGAIN) {
            ingredient = "Polygain";
        } else {
            ingredient = "Unknown";
        }

        searchid = string(abi.encodePacked(ingredient,_animalid,_datetime)); // searchid = [animalid|feedtype|datetime]
        feedSearch[searchid] = _feedid;
    }

    function updateFeed(string memory _feedid) public {
        require(feedExists[_feedid]);
        require(feeds[_feedid].Status==ClaimStatus.UNCLAIMED);
        feeds[_feedid].Status = ClaimStatus.CLAIMED;
    }

    function queryFeed(string memory _feedid) 
        public
        view
        returns(
            string memory,
            string memory,
            string memory,
            uint16,
            uint256,
            uint256)
    {
        require(feedExists[_feedid], "Feed ID does not exist.");
        string memory ingredient;
        string memory claimstatus;

        if (feeds[_feedid].FeedType == Ingredient.REGULAR) {
            ingredient = "Regular";
        } else if (feeds[_feedid].FeedType == Ingredient.ASPARAGOPSIS) {
            ingredient = "Asparagopsis";
        } else if (feeds[_feedid].FeedType == Ingredient.POLYGAIN) {
            ingredient = "Polygain";
        } else {
            ingredient = "Unknown";
        }

        if (feeds[_feedid].Status == ClaimStatus.UNCLAIMED) {
            claimstatus = "Unclaimed";
        } else if (feeds[_feedid].Status == ClaimStatus.UNCLAIMED) {
            ingredient = "Claimed";
        } else {
            ingredient = "Unknown";
        }

        return(
            ingredient,
            claimstatus,
            feeds[_feedid].AnimalID,
            feeds[_feedid].DMI,
            feeds[_feedid].DateTime,
            feeds[_feedid].BlockTime
        );
    }
}