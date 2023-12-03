// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./CCT_ERC721.sol";
import "./CST_ERC20.sol";

contract CloudAsABlockchainToken is ERC1155 {
    CloudStoragetoken private cstToken;
    CloudConfigToken private cctToken;
    uint256 public constant CST_ERC20_Token = 0;
    uint256 public constant CCT_ERC721_Token = 1;
    struct Data {
        uint256 cstAmount;
        uint256 cctTokenID;
    }
    address owner;
    uint tokenID = 1;
    mapping(uint => Data) rentalDetails;
    mapping(address => uint256[]) rentalIDs;

    modifier tokenAvailable(address user,uint256 amt) {
        require(
            getCSTBalance(user) >= amt,
            "Not enough storage coin left!"
        );
        _;
    }

    modifier onlyOwner (address user) {
        require(
          user==owner,
          "The user is not the owner! Function can only be called by the owner of the contract."  
        );
        _;
    }

    modifier CCTAvailable(address user) {
        require(
            cctToken.balanceOf(user)>0,
            "The user doesn't have any NFTs (CCT)!"
        );
        _;
    }

    modifier NFTOwnership(address user, uint256 tokenid) {
        require(
          cctToken.ownerOf(tokenid) == user,
          "The token ID given for the NFT is not owned by the user"  
        );
        _;
    }

    event rentalSuccess(string message);
    
    constructor(address cstTokenAddress, address cctTokenAddress) ERC1155("URI") {
        cstToken = CloudStoragetoken(cstTokenAddress);
        cctToken = CloudConfigToken(cctTokenAddress);
        owner = msg.sender;
        _mint(msg.sender,CST_ERC20_Token,1000000*(10 ** 18), "");
    }

    // function setURI(string memory newURI) external {
    //     _setURI(newURI);
    // }

    function transferinBatch(uint256 cctTokenID, uint256 cstAmount) public tokenAvailable(msg.sender,cstAmount) NFTOwnership(msg.sender,cctTokenID) 
    {
        uint256[] memory ids = new uint256[](2);
        ids[0] = CST_ERC20_Token;
        ids[1] = CCT_ERC721_Token;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = cstAmount*(10**18);
        amounts[1] = cctTokenID;
        // uint256[] string amounts = [cstAmount*(10 ** 18),cctTokenID];
        safeBatchTransferFrom(msg.sender,owner,ids,amounts,"");
    }


    function rentCloudDiskandServer(uint256 cctTokenID, uint256 cstAmount) external tokenAvailable(msg.sender,cstAmount) NFTOwnership(msg.sender,cctTokenID) 
    {    
        // Transfer ERC20 tokens from the sender to the contract
        cstToken.transferCSTToken(msg.sender, owner, cstAmount*(10 ** 18));
        cstToken.rentStorage(msg.sender,cstAmount);
        
        // Transfer ERC721 token from the sender to the owner
        // cctToken.safeTransferFrom(msg.sender, owner, cctTokenID);
        cctToken.transferCCT(msg.sender,owner,cctTokenID);
        cctToken.transferOwnership(msg.sender, owner, cctTokenID);
        
        // Mint ERC1155 tokens to the sender
        // _mint(msg.sender, tokenID, 1, "");
        transferinBatch(cctTokenID,cstAmount);
        rentalIDs[msg.sender].push(tokenID);
        rentalDetails[tokenID] = Data(cstAmount,cctTokenID);
        tokenID++;
        emit rentalSuccess("The user has successfully rented server and disk space.");
    }

    function getBalance(address user) public view returns (
        uint256 cst_balance,
        uint256 cct_balance
    )
    {
        uint256[] memory ids = new uint256[](2);
        ids[0] = CST_ERC20_Token;
        ids[1] = CCT_ERC721_Token;
        address[] memory add = new address[](2);
        add[0] = user;
        add[1] = user;
        uint256[] memory test = balanceOfBatch(add, ids);
        cst_balance = test[0];
        cst_balance /= (10 ** 18);
        cct_balance = test[1];
    }

    // function transferTokensToSomeone(address toaddress, uint256 cctTokenID, uint256 cstAmount) external {
        
    //     // Transfer ERC20 tokens from the sender to the contract
    //     cstToken.transferCSTToken(msg.sender, toaddress, cstAmount*(10 ** 18));
    //     cstToken.rentStorage(msg.sender,cstAmount);
        
    //     // Transfer ERC721 token from the sender to the owner
    //     cctToken.safeTransferFrom(msg.sender, toaddress, cctTokenID);
    //     cctToken.transferOwnership(msg.sender, toaddress, cctTokenID);
        
    //     // Mint ERC1155 tokens to the sender
    //     _mint(msg.sender, tokenID, 1, "");
    //     rentalIDs[msg.sender].push(tokenID);
    //     rentalDetails[tokenID] = Data(cstAmount,cctTokenID);
    //     tokenID++;
    // }

    function getCSTBalance(address user) public view returns (
        uint balance
    ){
        balance = cstToken.balanceOf(user);
        balance /= (10 ** 18);
    }

    function getDiskStorageRented(address user) public view returns (
        uint storageRented
    ){
        storageRented = cstToken.getUserStorageBalance(user);
    }

    function getConfigDetails(address user) public view CCTAvailable(user) returns (
        CloudConfigToken.ServerConfiguration[] memory
    ){
        CloudConfigToken.ServerConfiguration[] memory configs = new CloudConfigToken.ServerConfiguration[](5);
        configs = cctToken.getConfigList(user);
        return configs;
    }

    function buyCST(uint256 amount) external  {
        cstToken.buyToken(amount*(10 ** 18), msg.sender);
        _mint(msg.sender,CST_ERC20_Token,amount*(10 ** 18), "");

    }

    function buyCCT(
        string memory gpu,
        string memory processor,
        string memory ram,
        string memory cores,
        string memory os,
        string memory imageURL,
        string memory uri
    ) external {
        uint256 token = cctToken.mintConfigToken(msg.sender,gpu, processor, ram, cores, os, imageURL,uri);
        _mint(msg.sender,CCT_ERC721_Token,token,"");
    }

    function getRentalDetails(address user) public view returns (
        Data[] memory
    ) {
        uint256[] memory arr = rentalIDs[user];
        Data[] memory configs = new Data[](arr.length);        
        for (uint i=0; i<arr.length ; i++){
            configs[i]= rentalDetails[arr[i]];
        }
        return configs;
    }

    function getTokenDetails(uint256 tokenId) public view returns (
        CloudConfigToken.ServerConfiguration memory ret
    ) {
        ret = cctToken.getConfigData(tokenId); 
    }

}
