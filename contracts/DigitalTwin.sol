pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DigitalTwin is ERC721 {
    string[] public tks;

    mapping(string => uint256) public tkid; // mapping of tkname => id in uint256
    mapping(string => string) public metadata; // mapping of tkname => metadata
    mapping(string => bool) public tkExists;

    event NewTokenMinted(string tkname);
    event TokenUpdated(string tkname);
    event TokenDestroyed(string tkname);

    constructor(string memory _name, string memory _symbol)
        public
        ERC721(_name, _symbol)
    {}

    function mint(string memory _tkname, string memory _metadata) public {
        require(!tkExists[_tkname], "Token already exists.");
        tks.push(_tkname);
        uint256 id = tks.length;
        _mint(msg.sender, id);
        metadata[_tkname] = _metadata;
        tkid[_tkname] = id;
        tkExists[_tkname] = true;

        emit NewTokenMinted(_tkname);
    }

    function update(string memory _tkname, string memory _metadata) public {
        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(tkid[_tkname]) == address(msg.sender),
            "Only the token owner can update the token."
        );
        metadata[_tkname] = _metadata;

        emit TokenUpdated(_tkname);
    }

    function burn(string memory _tkname) public {
        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(tkid[_tkname]) == address(msg.sender),
            "Only the token owner can destroy the token."
        );

        _burn(tkid[_tkname]);

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
        return metadata[_tkname];
    }
}
