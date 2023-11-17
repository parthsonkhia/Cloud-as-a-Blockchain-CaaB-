// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CloudConfigToken is ERC721URIStorage {
    // To store the address of the owner of the contract
    address owner;
    uint256 tokenID = 1;
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
    mapping (address => uint256[]) private tokenList;

    constructor() ERC721("Cloud Config Token", "CCT") {
        owner = msg.sender;
    }

    function mintConfigToken(
        // address owner,
        // uint256 tokenID,
        // string memory tURI,
        address user,
        string memory gpu,
        string memory processor,
        string memory ram,
        string memory cores,
        string memory os,
        string memory imageURL,
        address operator
    ) external {
        _mint(user, tokenID);
        _setTokenURI(tokenID, "");

        serverConfigs[tokenID] = ServerConfiguration(tokenID, gpu, processor, ram, cores, os, imageURL);
        tokenToCost[tokenID] = 1;
        tokenList[user].push(tokenID);
        tokenID++;
        setApprovalForAll(operator, true);
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

    // function buyServerConfig(uint256 tokenId) external payable {
    //     uint256 cost = tokenToCost[tokenId];
    //     require(cost > 0, "Invalid token ID");
    //     require(msg.value >= cost, "Insufficient funds to purchase server config");

    //     // Transfer the token to the buyer
    //     safeTransferFrom(ownerOf(tokenId), msg.sender, tokenId);

    //     // Send the payment to the seller (contract owner)
    //     address payable seller = payable(owner);
    //     seller.transfer(msg.value);
    // }

    function getConfigList(address user) public view returns (
        ServerConfiguration[] memory configs
    ) {
        uint256[] memory arr = tokenList[user];
        
        for (uint i=0; i<arr.length ; i++){
            configs[i]= serverConfigs[arr[i]];
        }
    }

    function remove(uint val, address user) internal{
        uint index;
        for (uint i = 0 ; i < tokenList[user].length ; i++) {
            if (tokenList[user][i]==val){
                index=i;
                break;
            }
        }
        for (uint i = index; i < tokenList[user].length - 1; i++) {
            tokenList[user][i] = tokenList[user][i + 1];
        }
        tokenList[user].pop();
    }

    function transferOwnership(address from, address to, uint256 tokenId) public {
        remove(tokenId,from);
        tokenList[to].push(tokenId);
    }
    
}