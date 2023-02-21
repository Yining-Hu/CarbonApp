// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FarmRegistry {

    struct Farm {
        address Farmer;
    }

    mapping(string => Farm) public farms;
    mapping(string => bool) public farmExists;
    string[] public allfarms;

    function registerFarm(string memory _farmid) public 
    {
        require(farmExists[_farmid] == false, "Farm already exists.");
        farms[_farmid] = Farm(msg.sender); // farmers register themselves
        farmExists[_farmid] = true;
        allfarms.push(_farmid);
    }

    function queryFarm(string memory _farmid) public view returns(address)
    {
        require(farmExists[_farmid] == true, "Farm does not exist.");
        return(farms[_farmid].Farmer);
    }

    function queryAll() public view
    returns(
        string[] memory,
        address[] memory
    ) 
    {
        address[] memory farmers = new address[](allfarms.length);

        for(uint256 i=0; i<allfarms.length; i++) {
            farmers[i] = farms[allfarms[i]].Farmer;
        }

        return(allfarms,farmers);
    }
}