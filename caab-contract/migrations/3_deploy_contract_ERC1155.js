var CST_ERC20 = artifacts.require("CloudStoragetoken");
var CCT_ERC721 = artifacts.require("CloudConfigToken");
var CAB_ERC1155 = artifacts.require("TokenTransfer");

// module.exports = function(deployer) {
//     deployer.deploy(CST_ERC20,1000000).then(() => {
//         console.log('CST ERC20 Smart Contract Deployed and this is the address - ',CST_ERC20.address);
//         deployer.deploy(CCT_ERC721).then(() => {
//             console.log('CCT ERC721 Smart Contract Deployed and this is the address - ',CCT_ERC721.address);
//             deployer.deploy(CAB_ERC1155,CST_ERC20.address,CCT_ERC721.address);
//         })    
//     })
// };

module.exports = function(deployer) {
    deployer.deploy(CAB_ERC1155,CST_ERC20.address,CCT_ERC721.address).then(() => {
        console.log('CAB ERC1155 Smart Contract Deployed and this is the address - ',CAB_ERC1155.address);
    })
}