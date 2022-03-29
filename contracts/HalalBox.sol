// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./DigitalTwin.sol";

contract HalalBox is DigitalTwin {
    constructor() DigitalTwin("HalalBox Token", "HBox") {}
}