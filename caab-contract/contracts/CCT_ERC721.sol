// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CloudConfigToken is ERC721URIStorage {
    // To store the address of the owner of the contract
    address owner;
    uint256 public tokenID = 1;
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

    mapping (uint256 => ServerConfiguration) public serverConfigs;
    mapping (uint256 => uint256) public tokenToCost;
    mapping (address => uint256[]) public tokenList;

    event NFTminted(string message);
    event NFTOwnershipTransferred(string message);

    modifier userNotCaller (address user, address functionCaller) {
        require(
          user!=functionCaller,
          "The user should be the caller of mintConfigToken function. It should be called by the owner or the ERC1155 contract!"
        );
        _;
    }

    constructor() ERC721("Cloud Config Token", "CCT") {
        owner = msg.sender;
    }

    function getTokenId() public view returns (
        uint256 t
    )
    {
        t=tokenID;
    }

    function mintConfigToken(
        address user,
        string memory gpu,
        string memory processor,
        string memory ram,
        string memory cores,
        string memory os,
        string memory imageURL,
        string memory uri 
    ) public returns (
        uint256 token
    ) {
        _mint(user, tokenID);
        _setTokenURI(tokenID, uri);
        // _setTokenURI(tokenID, uri);

        serverConfigs[tokenID] = ServerConfiguration(tokenID, gpu, processor, ram, cores, os, imageURL);
        tokenToCost[tokenID] = 1;
        tokenList[user].push(tokenID);
        token=tokenID;
        tokenID++;
        // setApprovalForAll(operator, true);
        emit NFTminted("Minted NFT successfully for the user.");

    }

    function getConfigData(uint256 tokenId) public view returns (
        ServerConfiguration memory config
    ) {
        config = serverConfigs[tokenId];
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
        ServerConfiguration[] memory
    ) {
        uint256[] memory arr = tokenList[user];
        ServerConfiguration[] memory configs = new ServerConfiguration[](arr.length);
        for (uint256 i=0; i<arr.length ; i++){
            configs[i]= serverConfigs[arr[i]];
        }
        return configs;
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
        emit NFTOwnershipTransferred("The ownership transfer of the NFT is successful");
    }

    function transferCCT(address from, address to, uint256 tokenId) public {
        _transfer(from, to, tokenId);
    }
    
}