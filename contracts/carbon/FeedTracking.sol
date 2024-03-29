// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "./AnimalRegistry.sol";
import "./HerdRegistry.sol";
import "./SeafeedRegistry.sol";

contract FeedTracking {
    // AnimalRegistry public animalregistry;
    HerdRegistry public herdregistry;
    SeafeedRegistry public seafeedregistry;

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
        string OrderID;
        // string AnimalID;
        string HerdID;
        uint16 DMI;
        uint256 DateTime;
    }

    mapping(string => FeedRecord) public feeds;
    mapping(string => bool) public feedExists;
    mapping(string => string) public feedSearch;
    mapping(string => bool) public feedClaimed; // value changes to true if a feed record has been used to claim carbon tokens.
    string[] public allfeeds;

    constructor(HerdRegistry _herdregistry, SeafeedRegistry _seafeedregistry)
    {
        // animalregistry = _animalregistry;
        herdregistry = _herdregistry;
        seafeedregistry = _seafeedregistry;
    }

    /**
     * ingredient Regular-0, Asparagopsis-1, Polygain-2
     */
    function logFeed(string memory _feedid, uint8 _feedtype, string memory _orderid, string memory _herdid, uint16 _dmi, uint256 _datetime) public 
    {
        require(!feedExists[_feedid], "Feed ID already exist.");
        // require(animalregistry.animalExists(_animalid), "Animal is not registed.");
        require(herdregistry.herdExists(_herdid), "Herd does not exist.");
        require(seafeedregistry.saleorderExists(_orderid), "Order does not exist.");
        (string memory customer,address customeraddr,uint16 quantity,string memory orderstatus,uint256 orderdatetime) = seafeedregistry.querySaleOrder(_orderid);
        require(customeraddr == msg.sender, "The farmer is not the purchaser of the seafeed.");

        string memory searchid;
        string memory ingredient;

        feeds[_feedid] = FeedRecord(Ingredient(_feedtype), ClaimStatus.UNCLAIMED, _orderid, _herdid, _dmi, _datetime); //, block.timestamp
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

        searchid = string(abi.encodePacked(ingredient,_herdid,_datetime)); // searchid = [herdid|feedtype|datetime]
        feedSearch[searchid] = _feedid;
        allfeeds.push(_feedid);
    }

    function claimFeed(string memory _feedid) public {
        require(feedExists[_feedid], "Feed ID does not exist.");
        require(feeds[_feedid].Status==ClaimStatus.UNCLAIMED, "Feed record already claimed.");
        feeds[_feedid].Status = ClaimStatus.CLAIMED;
    }

    function queryFeed(string memory _feedid) 
        public
        view
        returns(
            string memory,
            string memory,
            string memory,
            string memory,
            uint16,
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
            claimstatus = "Claimed";
        } else {
            claimstatus = "Unknown";
        }

        return(
            ingredient,
            claimstatus,
            // feeds[_feedid].AnimalID,
            feeds[_feedid].HerdID,
            feeds[_feedid].OrderID,
            feeds[_feedid].DMI,
            feeds[_feedid].DateTime
        );
    }

    function queryAll() public view
        returns(
            string[] memory,
            string[] memory,
            string[] memory,
            string[] memory,
            string[] memory,
            uint16[] memory,
            uint256[] memory)
    {
        string[] memory ingredients = new string[](allfeeds.length);
        string[] memory claimstatus = new string[](allfeeds.length);
        // string[] memory animalids = new string[](allfeeds.length);
        string[] memory herdids = new string[](allfeeds.length);
        string[] memory orderids = new string[](allfeeds.length);
        uint16[] memory dmis = new uint16[](allfeeds.length);
        uint256[] memory datetimes = new uint256[](allfeeds.length);

        for(uint256 i=0; i<allfeeds.length; i++) {
            if (feeds[allfeeds[i]].FeedType == Ingredient.REGULAR) {
                ingredients[i] = "Regular";
            } else if (feeds[allfeeds[i]].FeedType == Ingredient.ASPARAGOPSIS) {
                ingredients[i] = "Asparagopsis";
            } else if (feeds[allfeeds[i]].FeedType == Ingredient.POLYGAIN) {
                ingredients[i] = "Polygain";
            } else {
                ingredients[i] = "Unknown";
            }

            if (feeds[allfeeds[i]].Status == ClaimStatus.UNCLAIMED) {
                claimstatus[i] = "Unclaimed";
            } else if (feeds[allfeeds[i]].Status == ClaimStatus.UNCLAIMED) {
                claimstatus[i] = "Claimed";
            } else {
                claimstatus[i] = "Unknown";
            }

            // animalids[i] = feeds[allfeeds[i]].AnimalID;
            herdids[i] = feeds[allfeeds[i]].HerdID;
            orderids[i] = feeds[allfeeds[i]].OrderID;
            dmis[i] = feeds[allfeeds[i]].DMI;
            datetimes[i] = feeds[allfeeds[i]].DateTime;
        }

        return(allfeeds,ingredients,claimstatus,herdids,orderids,dmis,datetimes);
    }
}