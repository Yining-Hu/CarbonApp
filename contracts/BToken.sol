// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BToken is ERC20{
    address public admin;
    mapping(string => address) public users;
    mapping(string => bool) public userExists;
    string[] public userNames;
    uint256 public userCount;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply)
        ERC20(_name, _symbol)
    {
        admin = msg.sender;
        _mint(admin, _totalSupply); // allocate all totalsupply of BTK to the contract admin/agent
    }

    function registerUser(string memory _name, address _addr) public {
        require(!userExists[_name], "User already exists.");
        users[_name] = _addr;
        userNames.push(_name);
        userExists[_name] = true;
        userCount = userCount+1;
    }

    // todo: remove in the next deployment
    // function queryUserAddress(string memory _name) public view returns (address)
    // {
    //     require(userExists[_name], "User does not exists.");
    //     return (users[_name]);
    // }

    function queryAllBalances() public view returns
    (
        string[] memory,
        uint256[] memory
    )
    {
        uint256[] memory balances = new uint256[](userCount);

        for(uint i=0; i<userCount; i++){
            balances[i] = balanceOf(users[userNames[i]]);
        }

        return (userNames, balances);
    }
}