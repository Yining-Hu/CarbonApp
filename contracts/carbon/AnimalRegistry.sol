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
    uint16 public animalCount;

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
            animalCount++;
            animals[_animalid] = Animal(_farmid,AnimalGroup(_animalgroup),new string[](0));
            animalExists[_animalid] = true;
        }

    function viewAnimal(string memory _animalid)
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
}