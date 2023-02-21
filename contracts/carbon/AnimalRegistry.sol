// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FarmRegistry.sol";

contract AnimalRegistry {
    FarmRegistry public farmregistry;

    enum AnimalGroup {
        INMILKING,
        DRY,
        PREGNANT
    }

    struct Animal {
        string FarmID;
        AnimalGroup Group;
        string[] DatesOnFarm;
    }

    mapping(string => Animal) public animals;
    mapping(string => bool) public animalExists;
    string[] public allanimals; // to record all animal ids

    constructor(FarmRegistry _farmregistry)
    {
        farmregistry = _farmregistry;
    }

    function registerAnimal(
        string memory _animalid, 
        string memory _farmid,
        uint8 _animalgroup) public 
        {
            require(animalExists[_animalid] == false, "Animal already exists.");
            require(farmregistry.farmExists(_farmid), "Farm does not exist.");
            animals[_animalid] = Animal(_farmid,AnimalGroup(_animalgroup),new string[](0));
            animalExists[_animalid] = true;
            allanimals.push(_animalid);
        }

    function updateDates(string memory _animalid, string[] memory _dates) public {
        require(animalExists[_animalid], "Animal does not exist.");
        animals[_animalid].DatesOnFarm = _dates;
    }

    function queryAnimal(string memory _animalid)
        public 
        view 
        returns(
            string memory, 
            string memory, 
            string[] memory)
        {
            require(animalExists[_animalid] == true, "Animal does not exist.");

            string memory group;

            if (animals[_animalid].Group == AnimalGroup.INMILKING) {
                group = "In Milking";
            } else if (animals[_animalid].Group == AnimalGroup.DRY) {
                group = "Dry";
            } else if (animals[_animalid].Group == AnimalGroup.PREGNANT) {
                group = "Pregnant";
            } else {
                group = "Unknown";
            }

            return(animals[_animalid].FarmID,
            group,
            animals[_animalid].DatesOnFarm);
        }

    function queryAll() public view 
    returns(
        string[] memory,
        string[] memory, 
        string[] memory, 
        string[][] memory
    )
    {
        string[] memory farmids = new string[](allanimals.length);
        string[] memory groups = new string[](allanimals.length);
        string[][] memory date_arrays = new string[][](allanimals.length);

        for(uint256 i=0; i<allanimals.length; i++){
            farmids[i] = animals[allanimals[i]].FarmID;

            if (animals[allanimals[i]].Group == AnimalGroup.INMILKING) {
                groups[i] = "In Milking";
            } else if (animals[allanimals[i]].Group == AnimalGroup.DRY) {
                groups[i] = "Dry";
            } else if (animals[allanimals[i]].Group == AnimalGroup.PREGNANT) {
                groups[i] = "Pregnant";
            } else {
                groups[i] = "Unknown";
            }

            for(uint256 j=0; j<animals[allanimals[i]].DatesOnFarm.length; j++){
                date_arrays[j][i] = animals[allanimals[i]].DatesOnFarm[j];
            }
        }

        return(allanimals,farmids,groups,date_arrays);
    }
}