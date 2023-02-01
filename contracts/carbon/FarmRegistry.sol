// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FarmRegistry {

    struct Farm {
        address Farmer;
    }

    mapping(string => Farm) public farms;
    mapping(string => bool) public farmExists;
    uint16 public farmCount;

    function registerFarm(string memory _farmid) public 
    {
        require(farmExists[_farmid] == false, "Farm already exists.");
        farmCount++;
        farms[_farmid] = Farm(msg.sender); // farmers register themselves
        farmExists[_farmid] = true;
    }

    function viewFarm(string memory _farmid) public view returns(address)
    {
        require(farmExists[_farmid] == true, "Farm does not exist.");
        return(farms[_farmid].Farmer);
    }
}