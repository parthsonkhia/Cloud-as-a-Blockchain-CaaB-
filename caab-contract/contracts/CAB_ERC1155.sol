// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./CCT_ERC721.sol";
import "./CST_ERC20.sol";

contract TokenTransfer is ERC1155 {
    IERC20 public erc20Token;
    IERC721 public erc721Token;
    address owner;
    
    constructor(address _erc20Address, address _erc721Address) ERC1155("URI") {
        erc20Token = IERC20(_erc20Address);
        erc721Token = IERC721(_erc721Address);
        owner = msg.sender;
    }

    function setURI(string memory newURI) external {
        _setURI(newURI);
    }

    function transferTokensToOwner(uint256 tokenId, uint256 erc20Amount) external {
        
        // Transfer ERC20 tokens from the sender to the contract
        erc20Token.transferFrom(msg.sender, address(this), erc20Amount);
        
        // Transfer ERC721 token from the sender to the owner
        erc721Token.safeTransferFrom(msg.sender, owner, tokenId);
        
        // Mint ERC1155 tokens to the sender
        // _mint(msg.sender, tokenId, 1, "");
    }
}
