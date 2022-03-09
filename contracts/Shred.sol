pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Moz.sol";

contract Shred is ERC721 {
    Moz public mozContract;
    uint256 constant b = 3; // 1 Moz bar for 10 bags of shredded Moz

    string[] public mozBars;
    string[] public mozBags;

    mapping(string => string) mozBagData;
    // mapping(string => bool) mozBars; // stores burned moz bars
    mapping(string => bool) mozBagExists;

    event NewTokenMinted(string tokenid);

    constructor(Moz _mozContract) public ERC721("Shredded Mozarrella", "SMOZ") {
        mozContract = _mozContract;
    }

    function mint(string memory _tokenid, string memory _metadata) public {
        require(!mozBagExists[_tokenid], "Token already exists.");
        mozBags.push(_tokenid);
        uint256 id = mozBags.length;
        _mint(msg.sender, id);
        mozBagData[_tokenid] = _metadata;
        mozBagExists[_tokenid] = true;

        emit NewTokenMinted(_tokenid);
    }

    function updateMoz(string memory _tokenid, string memory _metadata) public {
        mozContract.update(_tokenid, _metadata);
    }

    // shred takes the ids and metadata of all bags of mozzarella that are created from the mozzarella bar
    // to do: shred-burn can't be called due to owner address difference
    // function shred(
    //     // string memory _mozId,
    //     string[b] memory _mozBagIds,
    //     string[b] memory _metadata
    // ) public {
    //     // burn a Moz token
    //     require(mozContract.tokenExists(_mozId), "Invalid moz bar id.");
    //     require(
    //         mozContract.ownerOf(mozContract.tokenIdentifier(_mozId)) !=
    //             address(0),
    //         "Moz bar already shredded."
    //     );
    //     mozContract.burn(_mozId);

    //     // mint b bags of shredded mozzarella
    //     uint256 n = mozBars.length;
    //     for (uint256 i = n * b; i < (n + 1) * b; i++) {
    //         mint(_mozBagIds[i], _metadata[i]);
    //     }
    // }
}
