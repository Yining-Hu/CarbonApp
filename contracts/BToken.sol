// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BToken is ERC20{
    address public admin;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply)
        ERC20(_name, _symbol)
    {
        admin = msg.sender;
        _mint(admin, _totalSupply); // allocate all totalsupply of BTK to the contract admin/agent
    }
}