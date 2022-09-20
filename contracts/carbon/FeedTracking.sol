// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./HerdRegistry.sol";


contract FeedTracking {
    HerdRegistry public herdregistry;

    enum Ingredient {
        REGULAR,
        ASPARAGOPSIS,
        POLYGAIN
    }

    struct FeedRecord {
        uint256 herdID;
        Ingredient ingredient;
        uint256 quantity;
        bool ccminted;
        address farmer; // assume farmer is the one to log the feed record
        uint time;
        uint blocktime;
    }

    mapping(uint256 => FeedRecord) public feeds;
    uint256 public feedCount;

    constructor(HerdRegistry _herdregistry)
    {
        herdregistry = _herdregistry;
    }

    /**
     * when looking up for a particular feed record
     * we should allow flexible searching in the frontend or api
     * and convert the search result to herdID for the use on smart contract
     * 
     * time should be in date format in front end, and gets converted to unix timestamp for the sc
     */
    function logFeed(uint256 _herdID, uint8 _type, uint256 _quantity, uint _time) public 
    {
        require(herdregistry.herdExists(_herdID), "Herd is not registed.");

        feedCount++;
        feeds[feedCount].herdID = _herdID;
        feeds[feedCount].ingredient = Ingredient(_type);
        feeds[feedCount].quantity = _quantity;
        feeds[feedCount].ccminted = false;
        feeds[feedCount].farmer = msg.sender; // assume farmer calls the function himself; or we manage the accounts on the api
        feeds[feedCount].time = _time;
        feeds[feedCount].blocktime = block.timestamp;
    }

    /**
     * Todo: too many return values, had to remove blocktime
     */
    function viewFeed(uint256 _feedID) 
        public
        view
        returns(
            uint256,
            string memory,
            uint256,
            bool,
            address,
            uint)
    {
        string memory ingredient;

        if (feeds[_feedID].ingredient == Ingredient.REGULAR) {
            ingredient = "Regular";
        } else if (feeds[_feedID].ingredient == Ingredient.ASPARAGOPSIS) {
            ingredient = "Asparagopsis";
        } else if (feeds[_feedID].ingredient == Ingredient.POLYGAIN) {
            ingredient = "Polygain";
        } else {
            ingredient = "Unknown";
        }

        return
        (
            feeds[_feedID].herdID,
            ingredient,
            feeds[_feedID].quantity,
            feeds[_feedID].ccminted,
            feeds[_feedID].farmer,
            feeds[_feedID].time
        );
    }

    function verifyFeed(uint256 _feedID) public view returns (bool)
    {
        if (feeds[_feedID].time < feeds[_feedID].blocktime) {
            return(true);
        } else {
            return(false);
        }
    }
}