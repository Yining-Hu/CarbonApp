// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DigitalTwin is ERC721 {
    string[] public tks;
    address public admin;

    /**
     * Allow consumers to access the product verification results through apis.
     */
    enum Verificationstatus {
        PENDING,
        PROCESSORVERIFIED,
        PROCESSORDENIED
    }

    struct ProductTk {
        uint256 id;
        string metadata;
        Verificationstatus status;
    }

    mapping(string => ProductTk) public producttks; // mapping of tkname => ProductTk struct
    mapping(string => bool) public tkExists;

    event TokenUpdated(string tkname);
    event TokenVerified(string tkname);

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        admin = msg.sender;
    }

    function mint(string memory _tkname, string memory _metadata) public {

        require(!tkExists[_tkname], "Token already exists.");

        tks.push(_tkname);
        uint256 id = tks.length;
        _mint(msg.sender, id);
        
        producttks[_tkname].id = id;
        producttks[_tkname].metadata = _metadata;
        producttks[_tkname].status = Verificationstatus.PENDING;

        tkExists[_tkname] = true;
    }

    /**
     * update only updates the metadata of an existing token
     */
    function update(string memory _tkname, string memory _metadata) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(producttks[_tkname].id) == address(msg.sender),
            "Only the token owner can update the token."
        );

        producttks[_tkname].metadata = _metadata;

        emit TokenUpdated(_tkname);
    }

    /**
     * verify is called by process upon optical verification of the product
     */
    function verify(string memory _tkname, bool _status) public {

        require(tkExists[_tkname], "Token does not exist.");

        if (_status == true) {
            producttks[_tkname].status = Verificationstatus.PROCESSORVERIFIED;
        }
        else {
            producttks[_tkname].status = Verificationstatus.PROCESSORDENIED;
        }

        emit TokenVerified(_tkname);
    }

    function burn(string memory _tkname) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(producttks[_tkname].id) == address(msg.sender),
            "Only the token owner can destroy the token."
        );

        _burn(producttks[_tkname].id);
        delete producttks[_tkname];
    }

    /**
     * @notice for other solidity contracts to interact
     */
    function queryTokenFromContract(string memory _tkname)
        public
        view
        returns (uint256, string memory, Verificationstatus vstatus, address)
    {
        require(tkExists[_tkname], "Token does not exist.");

        return (producttks[_tkname].id, producttks[_tkname].metadata, vstatus, ownerOf(producttks[_tkname].id));
    }

    /**
     * @notice for js client to interact
     */
    function queryToken(string memory _tkname)
        public
        view
        returns (uint256, string memory, string memory, address)
    {
        require(tkExists[_tkname], "Token does not exist.");
        
        string memory status;

        if (producttks[_tkname].status == Verificationstatus.PENDING) {
            status = "pending verification";
        } else if (producttks[_tkname].status == Verificationstatus.PROCESSORVERIFIED) {
            status = "verified";
        } else {
            status = "denied";
        }

        return (producttks[_tkname].id, producttks[_tkname].metadata, status, ownerOf(producttks[_tkname].id));
    }

    /**
     * query the metadata of a token
     */
    function countToken() public view returns (uint256) {
        require(msg.sender == admin); // require caller to be the contract owner
        return tks.length;
    }

    function queryAll() public view returns (string[] memory) {
        require(msg.sender == admin); // require caller to be the contract owner
        return tks;
    }
}
