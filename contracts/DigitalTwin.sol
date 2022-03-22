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

    event NewTokenMinted(string tkname);
    event TokenUpdated(string tkname);
    event TokenDestroyed(string tkname);

    constructor(string memory _name, string memory _symbol)
        public
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

        emit NewTokenMinted(_tkname);
    }

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
     * verify and deny are called by process upon optical verification of the product
     */
    function verify(string memory _tkname) public {

        require(tkExists[_tkname], "Token does not exist.");

        producttks[_tkname].status = Verificationstatus.PROCESSORVERIFIED;
    }

    function deny(string memory _tkname) public {

        require(tkExists[_tkname], "Token does not exist.");

        producttks[_tkname].status = Verificationstatus.PROCESSORDENIED;
    }

    function burn(string memory _tkname) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(producttks[_tkname].id) == address(msg.sender),
            "Only the token owner can destroy the token."
        );

        _burn(producttks[_tkname].id);

        emit TokenDestroyed(_tkname);
    }

    // query the metadata of a token
    function countToken() public view returns (uint256) {
        return tks.length;
    }

    function queryToken(string memory _tkname)
        public
        view
        returns (string memory)
    {
        require(tkExists[_tkname], "Token does not exist.");
        return producttks[_tkname].metadata;
    }

    function queryAll() public returns (string[] memory) {
        require(msg.sender == admin); // require caller to be the contract owner
        return tks;
    }
}
