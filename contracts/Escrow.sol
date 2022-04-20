// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/AccessControl.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "./DigitalTwin.sol";
import "./MyTest.sol";

/**
 * @title EscrowService Contract, forked from https://github.com/AleRapchan/escrow-service
 * @author Yining Hu
 * @notice Building a single role access control Escrow Service using OpenZeppelin Escrow and RBAC
 */
contract EscrowService is AccessControl { //Ownable, 

    /**
     * @dev Roles are referred to by their bytes32 identifier. 
     * @dev These should be exposed in the external API and be unique. 
     */
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant BUYER_ROLE = keccak256("BUYER_ROLE");
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");

    address vault;
    address root;
    address payable agent;
    address payable buyer;
    address payable seller;
    
    uint256 public price;
    uint256 public fee;
    uint256 public initial_payment;
    uint256 public remaining_payment;

    using SafeMath for uint256;

    // DigitalTwin public digitaltwin;
    MyTest public mytest;
    
    enum EscrowState { OFFERED, DEPOSITTAKEN, BUYERAPPROVED, BUYERDENIED, PAYMENTSUCCESSFUL, PAYMENTREVERTED }

    struct Product{
        uint256 price;
        EscrowState state;
    }

    mapping (string => Product) public stock; // whole stock of offered items for sell in escrow arragement

    /**
     * @dev Create the community role, with `root` as a member.
     * @dev before setting up any user wallet, all buyers/sellers use a single buyer/seller address, which are maintained by Beston.
     * @dev the same goes for ownership tracking in DigitalTwin.sol.
     */
    constructor(address payable _buyer_address, address payable _seller_address) {
        vault = address(this); // vault set to be the contract address
        root = msg.sender;
        agent = payable(msg.sender);
        buyer = _buyer_address;
        seller= _seller_address;
        // fee = 1*10**18;
        
        _setupRole(AGENT_ROLE, agent);
        _setupRole(BUYER_ROLE, buyer);
        _setupRole(SELLER_ROLE, seller);
    }

    /**
     * @notice To prevent sending tokens to 0x0 address and the contract address
     */
    modifier validDestination( address to ) {
        require(to != address(0x0));
        require(to != address(this) );
        _;
    }

    /**
     * @notice to get the deployed DigitalTwin instance for accessing stored variables
     * @dev instead of pure inheriting
     */
    function setAddr(address _address) public {
        // digitaltwin = DigitalTwin(_address);
        mytest = MyTest(_address);
    }

    function offer(string memory _tkname , uint256 _price) public {
        Product memory product;
        product.price = _price; /// @dev double check the conversion in Polygon
        product.state = EscrowState.OFFERED;
        stock[_tkname] = product;
    }
    
    /**
     * @notice Buyer can make a deposit to products on offer
     * @dev Partial payment is sent to the seller, however, can change depending on the agreement
     */
    function BuyerSendPayment(string memory _tkname) external payable validDestination(agent) validDestination(seller) onlyRole(BUYER_ROLE) {
        require (msg.value >= fee + stock[_tkname].price, "Please make sure your deposit covers both the product price and agent fee!");
        //require (_seller == seller, "Buyer must confirm the seller address!");
        require (stock[_tkname].state == EscrowState.OFFERED , "Product is not on offer!");
        stock[_tkname].state = EscrowState.DEPOSITTAKEN ; 

        initial_payment = price.div(10); // initial payment set to be 10% of the total price
        remaining_payment = price.sub(initial_payment);

        payable(agent).transfer(fee);
        payable(seller).transfer(initial_payment); // using SafeMath lib
        payable(vault).transfer(remaining_payment);
    }

    function VerifyProduct(string memory _tkname) public view returns (bool) {
        (uint256 id, string memory metadata, DigitalTwin.Verificationstatus vstatus, address addr) = digitaltwin.queryTokenFromContract(_tkname);
        
        if (vstatus == DigitalTwin.Verificationstatus.PROCESSORVERIFIED) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @notice Buyer can approve the payment with or without verification
     * @dev when implementing the api and front end, buyer should have the option to proceed without or with verification
     */ 
    function BuyerApprove(string memory _tkname) public onlyRole(BUYER_ROLE) {
        require (stock[_tkname].state == EscrowState.DEPOSITTAKEN, "Buyer cannot approve without a deposit!");
        stock[_tkname].state = EscrowState.BUYERAPPROVED;
    }

    /**
     * @notice Buyer can deny the payment upon unsatisfactory verification result or for other reasons.
     */
    function BuyerDeny (string memory _tkname) public onlyRole(BUYER_ROLE) {
        require (stock[_tkname].state == EscrowState.DEPOSITTAKEN, "Buyer cannot deny without a deposit!");
        stock[_tkname].state = EscrowState.BUYERDENIED;
    }

    /**
     * @notice If conditions are met: escrow agent releases to seller.
     * @dev consider allowing seller to redeem without agent
     */
    function AgentConfirmTransaction (string memory _tkname) public validDestination(seller) onlyRole(AGENT_ROLE) {
        require (stock[_tkname].state == EscrowState.BUYERAPPROVED , "Awaiting buyer approval!");
        /// To do: send payment from vault to seller. How to be sure that agent can spend from the vault?
        seller.transfer(remaining_payment);
        stock[_tkname].state =  EscrowState.PAYMENTSUCCESSFUL;
    }

    /**
     * @notice If conditions does not met: escrow agent revert to buyer.
     */
    function AgentCancelTransaction (string memory _tkname) validDestination(buyer) onlyRole(AGENT_ROLE) public {
        require (stock[_tkname].state == EscrowState.BUYERDENIED , "Awaiting buyer denail!");
        buyer.transfer(remaining_payment); 
        stock[_tkname].state =  EscrowState.PAYMENTREVERTED;
    }

    /**
     * @notice Only the agent can check vault balance.
     */
    function VaultBalance () public onlyRole(AGENT_ROLE) returns(uint256){
        return vault.balance;
    }

}