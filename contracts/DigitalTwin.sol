// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DigitalTwin is ERC721 {
    string[] public alltks; // records all tks including burned
    address public admin;
    uint256 public tkcount; // count unburned tks

    /**
     * Recognition: Packaging
     * Verification: Product
     */
    enum Recognitionstatus {
        PENDING,
        VERIFIED,
        DENIED
    }

    enum Verificationstatus {
        PENDING,
        VERIFIED,
        DENIED
    }

    struct TkDetails {
        uint256 id;
        string metadata;
        Recognitionstatus rstatus;
        Verificationstatus vstatus;
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
        tkcount = tkcount + 1;
        
        tks[_tkname].id = id;
        tks[_tkname].metadata = _metadata;
        tks[_tkname].rstatus = Recognitionstatus.PENDING;
        tks[_tkname].vstatus = Verificationstatus.PENDING;

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
     * recognize is called by processor upon optical verification of the product
     */
    function recognize(string memory _tkname, bool _status) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(msg.sender == admin, "Only the token owner can update recognition status of the token.");

        if (_status == true) {
            tks[_tkname].rstatus = Recognitionstatus.VERIFIED;
        }
        else {
            tks[_tkname].rstatus = Recognitionstatus.DENIED;
        }

        emit TokenVerified(_tkname);
    }

    /**
     * verify is called by processor upon optical verification of the product
     */
    function verify(string memory _tkname, bool _status) public {

        require(tkExists[_tkname], "Token does not exist.");
        require(msg.sender == admin, "Only the token owner can update verification status of the token.");

        if (_status == true) {
            tks[_tkname].vstatus = Verificationstatus.VERIFIED;
        }
        else {
            tks[_tkname].vstatus = Verificationstatus.DENIED;
        }

        emit TokenVerified(_tkname);
    }

    function burn(string memory _tkname) public {
        require(tkExists[_tkname], "Token does not exist.");
        require(
            ownerOf(tks[_tkname].id) == address(msg.sender),
            "Only the token owner can destroy the token."
        );

        _burn(tks[_tkname].id); // transfer the token to the 0x address
        tkExists[_tkname] = false; // change existence to false
        tkcount = tkcount-1;

        /// @notice: To delete from alltks: 1. find the index of an element; 2. to remove an element - shift the elements after the index and remove the last
        // uint i = 0;
        // uint j;
        // while (keccak256(abi.encodePacked(alltks[i])) != keccak256(abi.encodePacked(_tkname))) {
        //     i++;
        // }
        // for (j=i; j<alltks.length-1; j++) {
        //     alltks[j] = alltks[j+1];
        // }
        // alltks.pop(); // remove the token from the alltks list

        // delete tks[_tkname]; // delete token from the mapping
    }

    /// @notice tx.origin is the user account that starts the call, msg.sender is the contract that calls this contract
    function transferByName(string memory _tkname, address _to) public {
        require(tkExists[_tkname], "Token does not exist.");
        require(ownerOf(tks[_tkname].id) == tx.origin, "Only token owner can transfer the token.");

        _transfer(tx.origin,_to,tks[_tkname].id);
    }

    function approveByName(string memory _tkname, address _to) public {
        require(tkExists[_tkname], "Token does not exist.");
        require(ownerOf(tks[_tkname].id) == tx.origin, "Only token owner can transfer the token.");

        _approve(_to, tks[_tkname].id);
    }

    /**
     * @notice for js client to interact
     */
    function queryToken(string memory _tkname)
        public
        view
        returns (uint256, string memory, string memory, string memory, address)
    {
        require(tkExists[_tkname], "Token does not exist.");
        
        string memory rstatus;
        string memory vstatus;

        if (tks[_tkname].rstatus == Recognitionstatus.PENDING) {
            rstatus = "pending packaging verification";
        } else if (tks[_tkname].rstatus == Recognitionstatus.VERIFIED) {
            rstatus = "packaging verified";
        } else {
            rstatus = "packaging denied";
        }

        if (tks[_tkname].vstatus == Verificationstatus.PENDING) {
            vstatus = "pending product verification";
        } else if (tks[_tkname].vstatus == Verificationstatus.VERIFIED) {
            vstatus = "product verified";
        } else {
            vstatus = "product denied";
        }

        return (tks[_tkname].id, tks[_tkname].metadata, rstatus, vstatus, ownerOf(tks[_tkname].id));
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

    function queryAllFields() 
        public 
        view 
        returns 
    (
        string[] memory, 
        uint256[] memory, 
        string[] memory, 
        string[] memory, 
        string[] memory,
        address[] memory
    ) 
    {
        string[] memory tkname = new string[](tkcount);
        uint256[] memory internal_id = new uint256[](tkcount);
        string[] memory metadata = new string[](tkcount);
        string[] memory rstatus = new string[](tkcount);
        string[] memory vstatus = new string[](tkcount);
        address[] memory owner = new address[](tkcount);

        for(uint256 i=0; i<alltks.length; i++){
            if (tkExists[alltks[i]] == true) {
                tkname[i] = alltks[i];
                internal_id[i] = tks[alltks[i]].id;
                metadata[i] = tks[alltks[i]].metadata;

                if (tks[alltks[i]].rstatus == Recognitionstatus.PENDING) {
                    rstatus[i] = "pending packaging verification";
                } else if (tks[alltks[i]].rstatus == Recognitionstatus.VERIFIED) {
                    rstatus[i] = "packaging verified";
                } else {
                    rstatus[i] = "packaging denied";
                }

                if (tks[alltks[i]].vstatus == Verificationstatus.PENDING) {
                    vstatus[i] = "pending product verification";
                } else if (tks[alltks[i]].vstatus == Verificationstatus.VERIFIED) {
                    vstatus[i] = "product verified";
                } else {
                    vstatus[i] = "product denied";
                }

                owner[i] = ownerOf(tks[alltks[i]].id);
            }
        }

        return (tkname, internal_id, metadata, rstatus, vstatus, owner);
    }
}
