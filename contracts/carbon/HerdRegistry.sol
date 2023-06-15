// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FarmRegistry.sol";

contract HerdRegistry {
    FarmRegistry public farmregistry;

    struct Herd {
        string FarmID;
        uint16 NumOfAnimals;
        uint16 DaysOnFarm;
    }

    mapping(string => Herd) public herds;
    mapping(string => bool) public herdExists;
    string[] public allherds; // to record all herd ids
    string[] public projectherds; // todo:for now the whole CarbonApp is designed to support 1 verra claim, so 1 project, later there should be more projects

    constructor(FarmRegistry _farmregistry)
    {
        farmregistry = _farmregistry;
    }

    function registerHerd(
        string memory _herdid,
        string memory _farmid,
        uint16 _numofherds,
        uint16 _daysonfarm) public 
        {
            require(herdExists[_herdid] == false, "Herd already exists.");
            require(farmregistry.farmExists(_farmid), "Farm does not exist.");
            herds[_herdid] = Herd(_farmid,_numofherds,_daysonfarm);
            herdExists[_herdid] = true;
            allherds.push(_herdid);
        }

    function queryHerd(string memory _herdid)
        public 
        view 
        returns(
            string memory, 
            uint16, 
            uint16)
        {
            require(herdExists[_herdid] == true, "Herd does not exist.");
            return(herds[_herdid].FarmID,
            herds[_herdid].NumOfAnimals,
            herds[_herdid].DaysOnFarm);
        }

    function queryAll() public view 
    returns(
        string[] memory,
        string[] memory, 
        uint16[] memory, 
        uint16[] memory
    )
    {
        string[] memory farmids = new string[](allherds.length);
        uint16[] memory nums = new uint16[](allherds.length);
        uint16[] memory ds = new uint16[](allherds.length);

        for(uint256 i=0; i<allherds.length; i++){
            farmids[i] = herds[allherds[i]].FarmID;
            nums[i] = herds[allherds[i]].NumOfAnimals;
            ds[i] = herds[allherds[i]].DaysOnFarm;
        }

        return(allherds,farmids,nums,ds);
    }
}