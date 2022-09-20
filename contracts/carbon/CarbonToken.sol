// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./HerdRegistry.sol";
import "./EmissionTracking.sol";
import "./FeedTracking.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CarbonToken is ERC20 {
    address public admin;

    HerdRegistry public herdregistry;
    FeedTracking public feedtracking;
    EmissionTracking public emissiontracking;

    uint private feedToCC = 10;
    uint private emissionToCC = 20;

    enum Source {
        FEED,
        EMISSION
    }

    constructor(string memory _name, string memory _symbol, HerdRegistry _herdregistry, FeedTracking _feedtracking, EmissionTracking _emissiontracking) 
        ERC20(_name, _symbol) 
    {
        admin = msg.sender; // assumes beston to be the aggregator and the contract admin

        herdregistry = _herdregistry;
        feedtracking = _feedtracking;
        emissiontracking = _emissiontracking;
    }

    /** 
     * using the data from feedtracking and emission tracking
     * Todo: for a particular day should only use either feedtracking or emissiontracking not both
     * Todo: to understand better the conversion from the measurements to the CC as feedToCC could be too simple
     */
    function mintCCByFeed(uint256 _feedID) internal {
        (uint256 herdID, string memory ingredient, uint256 quantity, bool ccminted, address farmer, uint time) = feedtracking.viewFeed(_feedID);

        require(farmer == msg.sender, "Only farm owner can mint Carbon Tokens.");
        require(ccminted == false, "Carbon Token already minted for this feed record.");

        _mint(msg.sender, quantity/feedToCC);
    }

    function mintCCByEmission(uint256 _emissionID) internal {
        (uint256 herdID, uint256 amount, bool ccminted, address farmer, uint time) = emissiontracking.viewEmission(_emissionID);

        require(farmer == msg.sender, "Only farm owner can mint Carbon Tokens.");
        require(ccminted == false, "Carbon Token already minted for this emission record.");

        _mint(msg.sender, amount/emissionToCC);
    }

    function transferToAggregator(address _from, address _to, uint256 _amount) public 
    {
        require(msg.sender == _from);
        require(admin == _to);

        _transfer(_from, _to, _amount);
    }

    /**
     * Todo: to understand the terms of binding and non-binding trading
     */
    function tradeBinding() public {}

    function tradeNonBinding() public {}
}