// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./DigitalTwin.sol";

contract MyTest is DigitalTwin {
    constructor() DigitalTwin("MyTest Token", "MTest") {}
}