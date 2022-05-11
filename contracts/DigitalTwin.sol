// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DigitalTwin is ERC721 {
    string[] public alltks; // to record all all tks
    address public admin;

    /**
     * Allow consumers to access the product verification results through apis.
     */
    enum Verificationstatus {
        PENDING,
        PROCESSORVERIFIED,
        PROCESSORDENIED
    }

    struct TkDetails {
        uint256 id;
        string metadata;
        Verificationstatus status;
    }

    mapping(string => TkDetails) public tks; // mapping of tkname => ProductTk struct
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

        alltks.push(_tkname);
        uint256 id = alltks.length;
        _mint(msg.sender, id);
        
        tks[_tkname].id = id;
        tks[_tkname].metadata = _metadata;
        tks[_tkname].status = Verificationstatus.PENDING;

        tkExists[_tkname] = true;
    }

    /**
     * update only updates the metadata of an existing token
     */
    function update(string memory _tkname, string memory _metadata) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(tks[_tkname].id) == address(msg.sender),
            "Only the token owner can update the token."
        );

        tks[_tkname].metadata = _metadata;

        emit TokenUpdated(_tkname);
    }

    /**
     * verify is called by process upon optical verification of the product
     */
    function verify(string memory _tkname, bool _status) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(tks[_tkname].id) == address(msg.sender),
            "Only the token owner can update verification status of the token."
        );

        if (_status == true) {
            tks[_tkname].status = Verificationstatus.PROCESSORVERIFIED;
        }
        else {
            tks[_tkname].status = Verificationstatus.PROCESSORDENIED;
        }

        emit TokenVerified(_tkname);
    }

    function burn(string memory _tkname) public {
        uint i = 0;
        uint j;

        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(tks[_tkname].id) == address(msg.sender),
            "Only the token owner can destroy the token."
        );

        _burn(tks[_tkname].id); // transfer the token to the 0x address
        tkExists[_tkname] = false; // change existence to false
        delete tks[_tkname]; // delete token from the mapping

        /// @dev: there doesn't seem to be a straight forward way to get all keys in a mapping - to find out
        /// @notice: 1. find the index of an element
        /// @notice: 2. to remove an element - shift the elements after the index and remove the last
        while (keccak256(abi.encodePacked(alltks[i])) != keccak256(abi.encodePacked(_tkname))) {
            i++;
        }
        
        for (j=i; j<alltks.length-1; j++) {
            alltks[j] = alltks[j+1];
        }

        alltks.pop(); // remove the token from the alltks list
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

        if (tks[_tkname].status == Verificationstatus.PENDING) {
            status = "pending verification";
        } else if (tks[_tkname].status == Verificationstatus.PROCESSORVERIFIED) {
            status = "verified";
        } else {
            status = "denied";
        }

        return (tks[_tkname].id, tks[_tkname].metadata, status, ownerOf(tks[_tkname].id));
    }

    /**
     * query the metadata of a token
     */
    function countToken() public view returns (uint256) {
        require(msg.sender == admin); // require caller to be the contract owner
        return alltks.length;
    }

    function queryAll() public view returns (string[] memory) {
        require(msg.sender == admin, "Only contract owner can query all tokens."); // require caller to be the contract owner
        return alltks;
    }
}
