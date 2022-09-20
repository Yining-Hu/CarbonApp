// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


contract HerdRegistry {

    struct AnimalGroup {
        uint256 mature;
        uint256 heifer;
        uint256 dry;
        uint256 fresh;
    }

    /**
     * To do: how to maually input farmer on-chain address
     */
    struct Herd {
        string farm;
        address farmer;
        string location;
        AnimalGroup groups;
    }

    mapping(uint256 => Herd) public herds;
    mapping(uint256 => bool) public herdExists;
    uint256 public herdCount;

    function registerHerd(
        string memory _farm, 
        string memory _location,
        uint256 _mature, 
        uint56 _heifer, 
        uint256 _dry, 
        uint256 _fresh) public 
        {
            herdCount++;
            herds[herdCount] = Herd(_farm, msg.sender, _location, AnimalGroup(_mature, _heifer, _dry, _fresh));
            herdExists[herdCount] = true;
        }

    function viewHerd(uint256 _herdID) 
        public 
        view 
        returns(
            string memory, 
            string memory, 
            uint256, 
            uint256, 
            uint256, 
            uint256) 
        {
            return(herds[_herdID].farm,
            herds[_herdID].location,
            herds[_herdID].groups.mature,
            herds[_herdID].groups.heifer,
            herds[_herdID].groups.dry,
            herds[_herdID].groups.fresh);
        }
}