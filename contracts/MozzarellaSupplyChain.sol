// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * Tracks all intermediate items in the mozzarella supply chain.
 * require tracking events and intermediate items to be pre-defined
 *
 * Supports representation of product transformation
 * e.g., tankblock_m and tankblock_n pair means m milktanks can create n mozzarellablocks
 */
contract MozzarellaSupplyChain is ERC1155 {
    uint256 tankblock_m = 1;
    uint256 tankblock_n = 3;

    uint256 blockbag_m = 1;
    uint256 blockbag_n = 20;

    enum ItemStatus {
        AWAITING,
        PROCESSED
    }

    struct Milktank {
        uint256 id;
        string metadata;
        ItemStatus status;
    }

    struct Mozzarellablock {
        uint256 id;
        string metadata;
        ItemStatus status;
    }

    struct Shreddedmozzarella {
        uint256 id;
        string metadata;
        ItemStatus status;
    }

    mapping(string => Milktank) public milktanks;
    mapping(string => Mozzarellablock) public mozzarellablocks;
    mapping(string => Shreddedmozzarella) public shreddedmozzarellas;

    mapping(string => bool) public milktankExists;
    mapping(string => bool) public mozzarellablockExists;
    mapping(string => bool) public shreddedmozzarellaExists;

    // to define struct for status of items

    uint256 public allTokenCount = 0; //stores the total number of minted tokens across all types

    constructor() public ERC1155("") {}

    /**
     * Convert milk tank names to uint ids for minting
     * ids are incremental as any new tokens are minted and should not be duplicate
     * store milktank names and metadata in mapping
     * to ensure non-fungiblility, amount is set to 1 for each milktank
     */
    function mintMilktank(
        address to,
        string[] memory names,
        string[] memory metadata
    ) public {
        require(names.length == metadata.length);

        for (uint256 i = 0; i < names.length; i++) {
            require(!milktankExists[names[i]], "Milk tank already exists.");
        }

        uint256[] memory ids;
        uint256[] memory amounts;

        for (uint256 i = 0; i < names.length; i++) {
            ids[i] = allTokenCount + i;
            milktanks[names[i]].id = ids[i];
            milktanks[names[i]].metadata = metadata[i];
            milktanks[names[i]].status = ItemStatus.AWAITING;
            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, "");
        allTokenCount += names.length;
    }

    function mintMozzarellablock(
        address to,
        string[] memory names,
        string[] memory metadata
    ) public {
        require(names.length == metadata.length);

        for (uint256 i = 0; i < names.length; i++) {
            require(!mozzarellablockExists[names[i]], "Mozzarella block already exists.");
        }

        uint256[] memory ids;
        uint256[] memory amounts;

        for (uint256 i = 0; i < names.length; i++) {
            ids[i] = allTokenCount + i;
            mozzarellablocks[names[i]].id = ids[i];
            mozzarellablocks[names[i]].metadata = metadata[i];
            mozzarellablocks[names[i]].status = ItemStatus.AWAITING;
            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, "");
        allTokenCount += names.length;
    }

    function mintShreddedmozzarella(
        address to,
        string[] memory names,
        string[] memory metadata
    ) public {
        require(names.length == metadata.length);

        for (uint256 i = 0; i < names.length; i++) {
            require(!shreddedmozzarellaExists[names[i]], "Shredded mozzarella already exists.");
        }

        uint256[] memory ids;
        uint256[] memory amounts;

        for (uint256 i = 0; i < names.length; i++) {
            ids[i] = allTokenCount + i;
            shreddedmozzarellas[names[i]].id = ids[i];
            shreddedmozzarellas[names[i]].metadata = metadata[i];
            shreddedmozzarellas[names[i]].status = ItemStatus.AWAITING;
            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, "");
        allTokenCount += names.length;
    }

    /**
     * To process an item means to burn it (remove ownership) and change the status to processed
     */
    function processMilk(address from, string[] memory names) public {
        for (uint256 i = 0; i < names.length; i++) {
            require(milktankExists[names[i]], "Milk tank doesn't exist.");
        }

        for (uint256 i = 0; i < names.length; i++) {
            _burn(from, milktanks[names[i]].id, 1);
            milktanks[names[i]].status = ItemStatus.PROCESSED;
        }
    }

    function processMozzarellablock(address from, string[] memory names) public {
        for (uint256 i = 0; i < names.length; i++) {
            require(mozzarellablockExists[names[i]], "Mozzarella block doesn't exist.");
        }

        for (uint256 i = 0; i < names.length; i++) {
            _burn(from, mozzarellablocks[names[i]].id, 1);
            mozzarellablocks[names[i]].status = ItemStatus.PROCESSED;
        }
    }

    /**
     * To transform milk tanks to mozzarella blocks
     * burn milk tank tokens, and create mozzarella block tokens, not removing metadata
     */
    function tankblockTransform(address from, address to, string[] memory tanks, string[] memory blocks, string[] memory metadata) public {
        require(tankblock_n*tanks.length == tankblock_m*blocks.length);

        processMilk(from, tanks);
        mintMozzarellablock(to, blocks, metadata);
    }

    function blockbagTransform(address from, address to, string[] memory blocks, string[] memory bags, string[] memory metadata) public {
        require(blockbag_n*blocks.length == blockbag_m*bags.length);

        processMozzarellablock(from, blocks);
        mintShreddedmozzarella(to, bags, metadata);
    }
}