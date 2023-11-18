// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CloudStoragetoken is ERC20 {
    uint256 public constant storageCost = 2 * 10**17; // Cost of 1GB data is 0.2 Token
    uint256 public availableStorage = 5000000;  // Total storage space in GB
    address owner; // To store the address of the owner of the contract

    mapping(address => uint256) public storageBalances; // To keep track of resources rented by each user

    constructor(uint256 value) ERC20("Cloud Storage Token", "CST") {
        owner = msg.sender;
        _mint(msg.sender, value * 10 ** uint256(decimals()));
    }

    // used to rent storage.s
    // function rentStorage(uint256 amount) external payable {
    //     require(amount > 0, "Amount must be greater than 0");
    //     require(balanceOf(msg.sender) >= amount * storageCost, "Not enough CST tokens to purchase storage");
    //     require(availableStorage >= amount, "Not enough storage space available");

    //     transferFrom(msg.sender, owner, amount * storageCost);
    //     storageBalances[msg.sender] += amount;
    //     availableStorage -= amount;
    // }
    function rentStorage(address user, uint256 diskrented) external {
        storageBalances[user] += (diskrented*5);
        availableStorage -= (diskrented*5);
    }

    function getAvailableStorage() external view returns (uint256) {
        return availableStorage;
    }

    function getUserStorageBalance(address user) external view returns (uint256) {
        return storageBalances[user];
    }

    function buyToken(uint256 amount, address user) external {

        // transferFrom(owner, user, amount);
        _transfer(owner, user, amount);
    }

    function transferCSTToken(address from, address to, uint256 value) external {

        _transfer(from, to, value);
    }

    // function approveContract() external 

}