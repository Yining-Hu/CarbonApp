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

    mapping(string => CBToken) public cbtokens;
    mapping(string => bool) public cbtokenExists;
    mapping(string => Distribution) public distributions;
    mapping(string => bool) public distributionExists;
    string[] public allcbtokens;
    string[] public alldistributions;

    constructor(string memory _uri, FarmRegistry _farmregistry, FeedTracking _feedtracking, EmissionTracking _emissiontracking)
        ERC1155(_uri)
    {
        admin = msg.sender;
        farmregistry = _farmregistry;
        feedtracking = _feedtracking;
        emissiontracking = _emissiontracking;
    }

    function issue(string memory _cbtokenid, uint256 _amount, string[] memory _feedids, uint256 _startdate, uint256 _enddate) public {
        require(msg.sender == admin, "Only admin can issue Carbon Tokens.");
        require(cbtokenExists[_cbtokenid] == false, "Carbon token id already exists.");
        _mint(admin,0,_amount,"");

        for(uint256 i=0; i<_feedids.length; i++){
            (string memory ingredient, string memory claimstatus, string memory animalid, string memory orderid, uint16 dmi, uint256 datetime)=feedtracking.queryFeed(_feedids[i]);
            require((datetime>=_startdate && datetime<=_enddate ), "The specified feed record is not in the claim period.");
            
            feedtracking.claimFeed(_feedids[i]);
        }

        cbtokens[_cbtokenid] = CBToken(0,_amount,_startdate,_enddate);
        allcbtokens.push(_cbtokenid);
        cbtokenExists[_cbtokenid] = true;
    }

    function distribute(string memory _cbtokenid, string memory _distributionid, string memory _farmid, uint256 _amount) public {
        require(msg.sender == admin, "Only admin can distribute Carbon Tokens.");
        require(cbtokenExists[_cbtokenid], "Carbon Token ID does not exist.");
        safeTransferFrom(admin,farmregistry.farms(_farmid),cbtokens[_cbtokenid].InternalID,_amount, "");
        distributions[_distributionid] = Distribution(_cbtokenid,_amount,farmregistry.farms(_farmid),false);
        distributionExists[_distributionid] = true;
        alldistributions.push(_distributionid);
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

    function queryAllCarbonToken() public view 
    returns(
        string[] memory,
        uint256[] memory,
        uint256[] memory,
        uint256[] memory,
        uint256[] memory
    )
    {
        uint256[] memory internalids = new uint256[](allcbtokens.length);
        uint256[] memory amounts = new uint256[](allcbtokens.length);
        uint256[] memory starts = new uint256[](allcbtokens.length);
        uint256[] memory ends = new uint256[](allcbtokens.length);

        for(uint256 i=0; i<allcbtokens.length; i++) {
            internalids[i] = cbtokens[allcbtokens[i]].InternalID;
            amounts[i] = cbtokens[allcbtokens[i]].Amount;
            starts[i] = cbtokens[allcbtokens[i]].StartDate;
            ends[i] = cbtokens[allcbtokens[i]].EndDate;
        }

        return(allcbtokens,internalids,amounts,starts,ends);
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

    function queryAllDistribution() public view 
    returns(
        string[] memory,
        string[] memory,
        uint256[] memory,
        address[] memory,
        bool[] memory
    )
    {
        string[] memory cbtokenids = new string[](alldistributions.length);
        uint256[] memory amounts = new uint256[](alldistributions.length);
        address[] memory farmers = new address[](alldistributions.length);
        bool[] memory paid = new bool[](alldistributions.length);

        for(uint256 i=0; i<alldistributions.length; i++){
            cbtokenids[i] = distributions[alldistributions[i]].CBTokenID;
            amounts[i] = distributions[alldistributions[i]].Amount;
            farmers[i] = distributions[alldistributions[i]].Farmer;
            paid[i] = distributions[alldistributions[i]].Paid;
        }

        return(alldistributions,cbtokenids,amounts,farmers,paid);
    }
}