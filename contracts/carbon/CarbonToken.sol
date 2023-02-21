// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./FarmRegistry.sol";
import "./FeedTracking.sol";
import "./EmissionTracking.sol";

contract CarbonToken is ERC1155 {
    address public admin;
    FarmRegistry public farmregistry;
    FeedTracking public feedtracking;
    EmissionTracking public emissiontracking;

    // CBT's internal ids
    // VERRA-0, ACCU-1, GOLDSTANDARD-2

    struct CBToken {
        uint256 InternalID; // the id used to mint a 1155 token
        uint256 Amount;
        uint256 StartDate;
        uint256 EndDate;
        // string[] FeedIDs; // the Carbon Token has to be linked to feed records
    }

    struct Distribution {
        string CBTokenID;
        uint256 Amount;
        address Farmer;
        bool Paid;
    }

    mapping(string => CBToken) cbtokens;
    mapping(string => bool) cbtokenExists;
    mapping(string => Distribution) distributions;
    mapping(string => bool) distributionExists;

    constructor(string memory _uri, FarmRegistry _farmregistry, FeedTracking _feedtracking, EmissionTracking _emissiontracking)
        ERC1155(_uri)
    {
        admin = msg.sender;
        farmregistry = _farmregistry;
        feedtracking = _feedtracking;
        emissiontracking = _emissiontracking;
    }

    // Todo: add a condition for issue, e.g., only if emissions are verified carbon tokens can be issued.
    function issue(string memory _cbtokenid, uint256 _amount, string[] memory _feedids, uint256 _startdate, uint256 _enddate) public {
        require(msg.sender == admin, "Only admin can issue Carbon Tokens.");
        require(cbtokenExists[_cbtokenid] == false, "Carbon token id already exists.");
        _mint(admin,0,_amount,"");

        for(uint256 i=0; i<_feedids.length; i++){
            (string memory ingredient, string memory claimstatus, string memory animalid, uint16 dmi, uint256 datetime, uint256 blocktime)=feedtracking.queryFeed(_feedids[i]);
            require((datetime>=_startdate && datetime<=_enddate ), "The specified feed record is not in the claim period.");
            
            feedtracking.updateFeed(_feedids[i]);
        }

        cbtokens[_cbtokenid] = CBToken(0,_amount,_startdate,_enddate);
        cbtokenExists[_cbtokenid] = true;
    }

    function distribute(string memory _cbtokenid, string memory _distributionid, string memory _farmid, uint256 _amount) public {
        require(msg.sender == admin, "Only admin can distribute Carbon Tokens.");
        require(cbtokenExists[_cbtokenid], "Carbon Token ID does not exist.");
        safeTransferFrom(admin,farmregistry.farms(_farmid),cbtokens[_cbtokenid].InternalID,_amount, "");
        distributions[_distributionid] = Distribution(_cbtokenid,_amount,farmregistry.farms(_farmid),false);
    }

    function update(string memory _distributionid) public {
        require(msg.sender == admin, "Only admin can update Carbon Token status.");
        require(distributionExists[_distributionid], "Distribution ID does not exist.");
        distributions[_distributionid].Paid = true;
    }

    function queryCarbonToken(string memory _cbtokenid) public view returns(uint256,uint256,uint256,uint256)
    {
        require(cbtokenExists[_cbtokenid], "Carbon Token ID does not exist.");
        return(
            cbtokens[_cbtokenid].InternalID,
            cbtokens[_cbtokenid].Amount,
            cbtokens[_cbtokenid].StartDate,
            cbtokens[_cbtokenid].EndDate
        );
    }

    function queryDistribution(string memory _distributionid) public view returns(string memory,uint256,address,bool)
    {
        require(distributionExists[_distributionid], "Distribution ID does not exist.");
        return(
            distributions[_distributionid].CBTokenID,
            distributions[_distributionid].Amount,
            distributions[_distributionid].Farmer,
            distributions[_distributionid].Paid
        );
    }
}