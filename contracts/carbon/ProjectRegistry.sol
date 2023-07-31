// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FarmRegistry.sol";
import "./HerdRegistry.sol";

contract ProjectRegistry {
    FarmRegistry public farmregistry;
    HerdRegistry public herdregistry;

    struct Project {
        uint256 Baselinestart;
        uint256 Baselineend;
        uint256 Projectstart;
        uint256 Projectend;
        string[] Herds;
    }

    mapping(string => Project) public projects;
    mapping(string => bool) public projectExists;
    string[] public allprojects;
    
    function registerProject(
        string memory _projectid,
        uint256 _baselinestart,
        uint256 _baselineend,
        uint256 _projectstart,
        uint256 _projectend
    ) public 
    {
        require(!projectExists[_projectid], "Project already exists.");
        projects[_projectid] = Project(_baselinestart,_baselineend,_projectstart,_projectend,new string[](0));
        projectExists[_projectid] = true;
        allprojects.push(_projectid);
    }

    function addHerdsToProject(string memory _projectid, string[] memory _herdids) public {
        require(projectExists[_projectid], "Project does not exist.");
        for(uint256 i=0; i<_herdids.length; i++){
            require(herdregistry.herdExists(_herdids[i]), "Herd does not exist.");
        }
        projects[_projectid].Herds = _herdids;
    }

    function queryProject(string memory _projectid) public view returns(uint256,uint256,uint256,uint256,string[] memory) 
    {
        require(projectExists[_projectid], "Project does not exist.");
        return(
            projects[_projectid].Baselinestart,
            projects[_projectid].Baselineend,
            projects[_projectid].Projectstart,
            projects[_projectid].Projectend,
            projects[_projectid].Herds
        );
    }

    function queryAll() public view
    returns(
        string[] memory,
        uint256[] memory,
        uint256[] memory,
        uint256[] memory,
        uint256[] memory,
        string[][] memory)
    {
        uint256[] memory blstarts = new uint256[](allprojects.length);
        uint256[] memory blends = new uint256[](allprojects.length);
        uint256[] memory pjstarts = new uint256[](allprojects.length);
        uint256[] memory pjends = new uint256[](allprojects.length);
        string[][] memory herd_arrays = new string[][](allprojects.length);

        for(uint256 i=0; i<allprojects.length; i++){
            blstarts[i] = projects[allprojects[i]].Baselinestart;
            blends[i] = projects[allprojects[i]].Baselinestart;
            pjstarts[i] = projects[allprojects[i]].Projectstart;
            pjends[i] = projects[allprojects[i]].Projectend;

            for(uint256 j=0; j<projects[allprojects[i]].Herds.length; j++){
                herd_arrays[j][i] = projects[allprojects[i]].Herds[j];
            }
        }

        return(allprojects,blstarts,blends,pjstarts,pjends,herd_arrays);
    }
}