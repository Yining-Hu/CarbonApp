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

    struct FeedRecord {
        Ingredient FeedType;
        string AnimalID;
        uint16 DMI;
        uint256 DateTime;
        uint256 BlockTime;
    }

    mapping(string => FeedRecord) public feeds;
    mapping(string => bool) public feedExists;
    uint256 public feedCount;

    constructor(AnimalRegistry _animalregistry)
    {
        animalregistry = _animalregistry;
    }

    /**
     * ingredient Regular-0, Asparagopsis-1, Polygain-2
     */
    function logFeed(string memory _feedid, uint8 _feedtype, string memory _animalID, uint16 _dmi, uint256 _datetime) public 
    {
        require(!feedExists[_feedid], "Feed ID already exist.");
        require(animalregistry.animalExists(_animalID), "Animal is not registed.");
        feedCount++;
        feeds[_feedid] = FeedRecord(Ingredient(_feedtype), _animalID, _dmi, _datetime, block.timestamp);
        feedExists[_feedid] = true;
    }

    function queryFeed(string memory _feedid) 
        public
        view
        returns(
            string memory,
            string memory,
            uint16,
            uint256,
            uint256)
    {
        require(feedExists[_feedid], "Feed ID does not exist.");
        string memory ingredient;

        if (feeds[_feedid].FeedType == Ingredient.REGULAR) {
            ingredient = "Regular";
        } else if (feeds[_feedid].FeedType == Ingredient.ASPARAGOPSIS) {
            ingredient = "Asparagopsis";
        } else if (feeds[_feedid].FeedType == Ingredient.POLYGAIN) {
            ingredient = "Polygain";
        } else {
            ingredient = "Unknown";
        }

        return
        (
            ingredient,
            feeds[_feedid].AnimalID,
            feeds[_feedid].DMI,
            feeds[_feedid].DateTime,
            feeds[_feedid].BlockTime
        );
    }

    function verifyFeedTime(string memory _feedid) public view returns (bool)
    {
        require(feedExists[_feedid], "Feed ID does not exist.");
        if (feeds[_feedid].DateTime < feeds[_feedid].BlockTime) {
            return(true);
        } else {
            return(false);
        }
    }
}