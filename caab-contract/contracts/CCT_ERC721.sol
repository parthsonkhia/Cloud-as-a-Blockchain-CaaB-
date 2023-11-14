// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CloudConfigToken is ERC721URIStorage {
    // To store the address of the owner of the contract
    address owner;
    // To store server configurations and map it to a particular ID for the NFT.
    struct ServerConfiguration {
        uint256 id;
        string gpu;
        string processor;
        string ram;
        string cores;
        string os;
        string imageURL;
    }

    mapping (uint256 => ServerConfiguration) private serverConfigs;
    mapping (uint256 => uint256) public tokenToCost;

    constructor() ERC721("Cloud Config Token", "CCT") {
        owner = msg.sender;
    }

    function mintConfigToken(
        // address owner,
        uint256 tokenID,
        string memory tURI,
        string memory gpu,
        string memory processor,
        string memory ram,
        string memory cores,
        string memory os,
        uint256 cost,
        string memory imageURL
    ) external {
        _mint(msg.sender, tokenID);
        _setTokenURI(tokenID, tURI);

        serverConfigs[tokenID] = ServerConfiguration(tokenID, gpu, processor, ram, cores, os, imageURL);
        tokenToCost[tokenID] = cost;
    }

    function getConfigData(uint256 tokenId) public view returns (
        uint256 id,
        string memory gpu,
        string memory processor,
        string memory ram,
        string memory cores,
        string memory os,
        string memory imageURL
    ) {
        ServerConfiguration memory config = serverConfigs[tokenId];
        id = config.id;
        gpu = config.gpu;
        processor = config.processor;
        ram = config.ram;
        cores = config.cores;
        os = config.os;
        imageURL = config.imageURL;
    }

    function buyServerConfig(uint256 tokenId) external payable {
        uint256 cost = tokenToCost[tokenId];
        require(cost > 0, "Invalid token ID");
        require(msg.value >= cost, "Insufficient funds to purchase server config");

        // Transfer the token to the buyer
        safeTransferFrom(ownerOf(tokenId), msg.sender, tokenId);

        // Send the payment to the seller (contract owner)
        address payable seller = payable(owner);
        seller.transfer(msg.value);
    }
}