// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./DigitalTwin.sol";
import "./BToken.sol";

/**
 * @title EscrowService Contract, forked from https://github.com/AleRapchan/escrow-service
 * @author Yining Hu
 * @notice Building a single role access control Escrow Service using OpenZeppelin Escrow and RBAC
 * @dev contract currently assume one buyer account and one seller account, should develop an additional wallet contract and allow new user registration
 * @dev Todo: to implement multi-sig, time-based escrow
 * @dev Todo: the easiest would be to transfer both money and ownership of the product to the agent 
 * @dev then to prevent agent from taking everything, agent needs to deposit, which can be slashed if caught faulty
 */
contract Escrow {

    address agent;
    uint256 public fee_btk;
    uint256 timeout;

    using SafeMath for uint256;

    DigitalTwin public digitaltwin;
    BToken public btk;
    
    enum EscrowState { OFFERED, DEPOSITTAKEN, SELLERREDEEMED, BUYERDENIED } //PAYMENTSUCCESSFUL, PAYMENTREVERTED

    struct Product{
        uint256 price;
        address buyer;
        address seller;
        EscrowState state;
        uint256 timeout; // timeout for payment settlement
    }

    string[] allproducts;
    mapping (string => Product) public stock; // whole stock of offered items for sale in escrow arragement
    mapping(string => bool) public productExists;

    event DepositTaken(string tkname, uint256 price);

    /**
     * @dev before setting up any user wallet, all buyers/sellers use a single buyer/seller address, which are maintained by Beston.
     */
    constructor(DigitalTwin _digitaltwin) {
        digitaltwin = _digitaltwin;
        btk = new BToken("BT", "BT", 1000000);
        agent = msg.sender;
        fee_btk = 1;
        timeout = 5 minutes;
    }

    modifier validDestination(address to) {
        require(to != address(0x0), "Recipient should have a valid address!");
        require(to != address(this), "Recipient should not be the contract!");
        _;
    }

    modifier validProduct(string memory _tkname) {
        require(productExists[_tkname], "Product does not exist.");
        _;
    }

    function offer(string memory _tkname , uint256 _price) public {
        require(!productExists[_tkname], "Product is already offered.");
        require(digitaltwin.tkExists(_tkname), "Product token is not minted.");

        // should also require the caller to be the owner of the product
        (uint256 id, string memory metadata, string memory rstatus, string memory vstatus, address addr) = digitaltwin.queryToken(_tkname);
        require(msg.sender == addr, "Only owner of a token can offer it as a product.");

        Product memory product;
        product.price = _price; /// @dev double check the conversion in Polygon
        product.state = EscrowState.OFFERED;
        product.seller = msg.sender;
        stock[_tkname] = product;
        productExists[_tkname] = true;
        allproducts.push(_tkname);

        // transfer the token ownership to the agent
        digitaltwin.transferByName(_tkname,agent);
    }

    /**
     * buyBTK allows a caller to buy BTK from Escrow
     * sellBTK allows a caller to sell BTK to Escrow
     */
    function buyBTK() payable public {
        uint256 amountTobuy = msg.value;
        uint256 dexBalance = btk.balanceOf(address(this));
        require(amountTobuy > 0, "You need to send some ether");
        require(amountTobuy <= dexBalance, "Not enough tokens in the reserve");
        btk.transfer(msg.sender, amountTobuy);
    }

    function sellBTK(uint256 amount) public {
        require(amount > 0, "You need to sell at least some tokens");
        uint256 allowance = btk.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        btk.transferFrom(msg.sender, address(this), amount); // msg.sender is the caller, address(this) is Escrow
        payable(msg.sender).transfer(amount);
    }

    /**
     * @notice Buyer can make a deposit to products on offer
     */
    function BuyerDepositWithBTK(string memory _tkname, uint256 _deposit) external validDestination(agent) validProduct(_tkname) {
        require (_deposit == fee_btk + stock[_tkname].price, "Please make sure your deposit covers both the product price and agent fee!");
        require (stock[_tkname].state == EscrowState.OFFERED , "Product is not on offer!"); // this also blocks buyer from making duplicatd deposit

        stock[_tkname].buyer = payable(msg.sender); //Todo: this doesn't need to be payable
        stock[_tkname].state = EscrowState.DEPOSITTAKEN;
        stock[_tkname].timeout = block.timestamp + timeout; // add a timeout for settlement when buyer sends deposit

        btk.transferFrom(msg.sender, address(this), _deposit); // buyer transfers the deposit to Escrow (provided that buyer approves separately)
        btk.transfer(agent, fee_btk); // buyer transfers the agent fee via Escrow, this msg.sender is Escrow
        
        emit DepositTaken(_tkname, stock[_tkname].price);
    }

    function AgentApproveWithBTK(string memory _tkname) public validDestination(stock[_tkname].seller) validProduct(_tkname) {
        require (msg.sender == agent, "Only agent can call the redeem function.");
        require (stock[_tkname].state == EscrowState.DEPOSITTAKEN, "No deposit found for this product.");
        require (block.timestamp < stock[_tkname].timeout, "Agent can only approve the payment before the specified timeout.");
        btk.transfer(stock[_tkname].seller, stock[_tkname].price); // Escrow transfers the product price to seller
        stock[_tkname].state = EscrowState.SELLERREDEEMED;
    }

    /**
     * @notice Buyer can deny the payment upon unsatisfactory verification result or for other reasons.
     */
    function AgentDenyWithBTK(string memory _tkname) public validDestination(stock[_tkname].buyer) validProduct(_tkname) {
        require (msg.sender == agent, "Only agent can call the refund function.");
        require (stock[_tkname].state == EscrowState.DEPOSITTAKEN, "No deposit found for this product.");
        require (block.timestamp > stock[_tkname].timeout, "Agent can only issue the refund after the specified timeout.");
        btk.transfer(stock[_tkname].buyer, stock[_tkname].price);
        stock[_tkname].state = EscrowState.BUYERDENIED;
    }

    /**
     * @notice getters
     */

    function VerifyPackaging(string memory _tkname) public view validProduct(_tkname) returns (bool) {
        (uint256 id, string memory metadata, string memory rstatus, string memory vstatus, address addr) = digitaltwin.queryToken(_tkname);
        if (keccak256(abi.encodePacked(rstatus)) == keccak256(abi.encodePacked("packaging verified"))) {
            return true;
        } else {
            return false;
        }
    }

    function VerifyProduct(string memory _tkname) public view validProduct(_tkname) returns (bool) {
        (uint256 id, string memory metadata, string memory rstatus, string memory vstatus, address addr) = digitaltwin.queryToken(_tkname);
        if (keccak256(abi.encodePacked(vstatus)) == keccak256(abi.encodePacked("product verified"))) {
            return true;
        } else {
            return false;
        }
    }

    function QueryProduct(string memory _tkname) public view validProduct(_tkname) returns(uint256, string memory, address, address) {
        string memory state;

        if (stock[_tkname].state == EscrowState.OFFERED) {
            state = "product on offer";
        } else if (stock[_tkname].state == EscrowState.DEPOSITTAKEN) {
            state = "deposit taken";
        } else if (stock[_tkname].state == EscrowState.SELLERREDEEMED) {
            state = "payment successful";
        } else if (stock[_tkname].state == EscrowState.BUYERDENIED) {
            state = "payment returned";
        } else {
            state = "unknown escrow state";
        }

        return (stock[_tkname].price, state, stock[_tkname].seller, stock[_tkname].buyer);
    }

    function QueryAllProducts() 
        public
        view
        returns
    (
        string[] memory, 
        uint256[] memory, 
        string[] memory,
        address[] memory,
        address[] memory
    )
    {
        uint256[] memory prices = new uint256[](allproducts.length);
        string[] memory states = new string[](allproducts.length);
        address[] memory sellers = new address[](allproducts.length);
        address[] memory buyers = new address[](allproducts.length);

        for(uint i=0; i<allproducts.length; i++){
            prices[i] = stock[allproducts[i]].price;

            if (stock[allproducts[i]].state == EscrowState.OFFERED) {
                states[i] = "product on offer";
            } else if (stock[allproducts[i]].state == EscrowState.DEPOSITTAKEN) {
                states[i] = "deposit taken";
            } else if (stock[allproducts[i]].state == EscrowState.SELLERREDEEMED) {
                states[i] = "payment successful";
            } else if (stock[allproducts[i]].state == EscrowState.BUYERDENIED) {
                states[i] = "payment returned";
            } else {
                states[i] = "unknown escrow state";
            }

            sellers[i] = stock[allproducts[i]].seller;
            buyers[i] = stock[allproducts[i]].buyer;
        }

        return (allproducts, prices, states, sellers, buyers);
    }
}