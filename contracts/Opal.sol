pragma solidity ^0.8.0;

import "./DigitalTwin.sol";

contract Opal is DigitalTwin {
    constructor() public DigitalTwin("Opal Token", "OPAL") {}
}
