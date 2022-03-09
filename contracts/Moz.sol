pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Moz is ERC721 {
    string[] public mozIds;

    mapping(string => uint256) public tokenIdentifier; // mapping of tokenid => id in uint256
    mapping(string => string) public mozData; // mapping of tokenid => hash string of all metadata
    mapping(string => bool) public tokenExists;

    event NewTokenMinted(string tokenid);
    event TokenUpdated(string tokenid);
    event TokenDestroyed(string tokenid);

    constructor() public ERC721("Mozarrella Bar", "MOZ") {}

    function mint(string memory _tokenid, string memory _metadata) public {
        require(!tokenExists[_tokenid], "Token already exists.");
        mozIds.push(_tokenid);
        uint256 id = mozIds.length;
        _mint(msg.sender, id);
        mozData[_tokenid] = _metadata;
        tokenIdentifier[_tokenid] = id;
        tokenExists[_tokenid] = true;

        emit NewTokenMinted(_tokenid);
    }

    function update(string memory _tokenid, string memory _metadata) public {
        require(tokenExists[_tokenid], "Token does not exist.");
        require(
            ownerOf(tokenIdentifier[_tokenid]) == address(msg.sender),
            "Only the token owner can update the token."
        );
        mozData[_tokenid] = _metadata;

        emit TokenUpdated(_tokenid);
    }

    function burn(string memory _tokenid) public {
        require(tokenExists[_tokenid], "Token does not exist.");
        require(
            ownerOf(tokenIdentifier[_tokenid]) == address(msg.sender),
            "Only the token owner can destroy the token."
        );

        _burn(tokenIdentifier[_tokenid]);

        emit TokenDestroyed(_tokenid);
    }

    function countToken() public view returns (uint256) {
        return mozIds.length;
    }

    function queryToken(string memory _tokenid)
        public
        view
        returns (string memory)
    {
        require(tokenExists[_tokenid], "Token does not exist.");
        return mozData[_tokenid];
    }
}
