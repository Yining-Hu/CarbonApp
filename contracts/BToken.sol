// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract BToken {
    string public name = "Beston Token";
    string public symbol = "BTK";
    string public standard = "Beston Token v1.0";
    address public owner;
    uint public totalSupply;

    event Transfer(
        address indexed _owner,
        address indexed _spender,
        uint _value
    );

    mapping(address => uint) public balanceOf;

    constructor(uint _initialSupply) {
        owner = msg.sender;
        balanceOf[owner] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint _value) public returns(bool) {
        require(
            balanceOf[msg.sender] >= _value
        );

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function getBalance(address _addr) public view returns(uint) {
        return balanceOf[_addr];
    }

    function getTotalSupply() public view returns(uint) {
        return totalSupply;
    }
}