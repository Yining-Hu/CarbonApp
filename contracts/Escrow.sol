// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./DigitalTwin.sol";

/**
 * @title EscrowService Contract, forked from https://github.com/AleRapchan/escrow-service
 * @author Yining Hu
 * @notice Building a single role access control Escrow Service using OpenZeppelin Escrow and RBAC
 * @dev To do: Removing rold based access control makes payments successful. However, this can be added manually as "requires"
 * @dev contract currently assume one buyer account and one seller account, should develop an additional wallet contract and allow new user registration
 */
contract Escrow { //Ownable, 

    /**
     * @dev Roles are referred to by their bytes32 identifier. 
     * @dev These should be exposed in the external API and be unique.
     * To do: to add a mapping to check if token exists and insert the requirements in query functions
     */

    address agentaddr;
    address buyeraddr;
    address selleraddr;

    address payable agent;
    address payable buyer;
    address payable seller;
    
    uint256 public fee;
    uint256 public initial_payment;
    uint256 public remaining_payment;

    using SafeMath for uint256;

    DigitalTwin public digitaltwin;
    
    enum EscrowState { OFFERED, DEPOSITTAKEN, BUYERAPPROVED, BUYERDENIED, PAYMENTSUCCESSFUL, PAYMENTREVERTED }

    struct Product{
        uint256 price;
        EscrowState state;
    }

    mapping (string => Product) public stock; // whole stock of offered items for sell in escrow arragement
    mapping(string => bool) public productExists;

    event DepositTaken(string tkname, uint256 price);

    /**
     * @dev before setting up any user wallet, all buyers/sellers use a single buyer/seller address, which are maintained by Beston.
     * @dev the same goes for ownership tracking in DigitalTwin.sol.
     */
    constructor(DigitalTwin _digitaltwin, address _buyer_address, address _seller_address) {
        digitaltwin = _digitaltwin;

        agentaddr = msg.sender;
        buyeraddr = _buyer_address;
        selleraddr = _seller_address;

        agent = payable(agentaddr);
        buyer = payable(buyeraddr);
        seller= payable(selleraddr);
        fee = 100;
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
        digitaltwin = DigitalTwin(_address);
    }

    function offer(string memory _tkname , uint256 _price) public {
        require(!productExists[_tkname], "Product is already offered.");

        Product memory product;
        product.price = _price; /// @dev double check the conversion in Polygon
        product.state = EscrowState.OFFERED;
        stock[_tkname] = product;
        productExists[_tkname] = true;
    }
    
    /**
     * @notice Buyer can make a deposit to products on offer
     * @dev Partial payment is sent to the seller, however, can change depending on the agreement
     */
    function BuyerSendPayment(string memory _tkname) external payable validDestination(agent) validDestination(seller) {
        require (msg.value >= fee + stock[_tkname].price, "Please make sure your deposit covers both the product price and agent fee!");
        //require (_seller == seller, "Buyer must confirm the seller address!");
        require (stock[_tkname].state == EscrowState.OFFERED , "Product is not on offer!"); // this also blocks buyer from making duplicatd deposit
        stock[_tkname].state = EscrowState.DEPOSITTAKEN;

        initial_payment = stock[_tkname].price.div(10); // initial payment set to be 10% of the total price
        remaining_payment = stock[_tkname].price.sub(initial_payment);

        agent.transfer(fee);
        seller.transfer(initial_payment);

        emit DepositTaken(_tkname, stock[_tkname].price);
    }

    function VerifyProduct(string memory _tkname) public view returns (bool) {
        require(productExists[_tkname], "Product does not exist.");

        (uint256 id, string memory metadata, string memory vstatus, address addr) = digitaltwin.queryToken(_tkname);
        if (keccak256(abi.encodePacked(vstatus)) == keccak256(abi.encodePacked("verified"))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @notice Buyer can approve the payment with or without verification
     * @dev when implementing the api and front end, buyer should have the option to proceed without or with verification
     */ 
    function BuyerApprove(string memory _tkname) public {
        require (msg.sender == buyer);
        require (stock[_tkname].state == EscrowState.DEPOSITTAKEN, "Buyer cannot approve without a deposit!");
        stock[_tkname].state = EscrowState.BUYERAPPROVED;
    }

    /**
     * @notice Buyer can deny the payment upon unsatisfactory verification result or for other reasons.
     */
    function BuyerDeny (string memory _tkname) public {
        require (msg.sender == buyer);
        require (stock[_tkname].state == EscrowState.DEPOSITTAKEN, "Buyer cannot deny without a deposit!");
        stock[_tkname].state = EscrowState.BUYERDENIED;
    }

    /**
     * @notice If conditions are met: escrow agent releases to seller.
     * @dev To do: to allow seller to redeem without agent/buyer to approve without agent
     */
    function AgentConfirmTransaction (string memory _tkname) public validDestination(seller) {
        require (msg.sender == agent);
        require (stock[_tkname].state == EscrowState.BUYERAPPROVED , "Awaiting buyer approval!");
        seller.transfer(remaining_payment);
        stock[_tkname].state =  EscrowState.PAYMENTSUCCESSFUL;
    }

    /**
     * @notice If conditions does not met: escrow agent revert to buyer.
     */
    function AgentCancelTransaction (string memory _tkname) validDestination(buyer) public {
        require (msg.sender == agent);
        require (stock[_tkname].state == EscrowState.BUYERDENIED , "Awaiting buyer denail!");
        buyer.transfer(remaining_payment); 
        stock[_tkname].state =  EscrowState.PAYMENTREVERTED;
    }

    /**
     * @notice getters
     */
    function GetUsers () public view returns(address, address) {
        require (msg.sender == agent);
        return (buyer,seller);
    }

    function QueryProduct (string memory _tkname) public view returns(uint256, EscrowState, bool) {
        require(productExists[_tkname], "Product does not exist.");
        bool vstatus = VerifyProduct(_tkname);
        return (stock[_tkname].price, stock[_tkname].state, vstatus);
    }
}