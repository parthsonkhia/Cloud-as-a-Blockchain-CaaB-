# Cloud-as-a-Blockchain-CaaB

Centralized cloud platforms exhibit lack of interoperability, vendor lock-in, and limited verifiability of resource ownership. Users cannot easily transfer workloads across clouds nor audit allocated configurations. The opacity of resource management disempowers clients and disconnects providers from infrastructure operations. This project enables an open cloud computing marketplace by representing hardware and software assets on a public blockchain using ERC token standards. Recording machine configurations as verifiable, transferable tokens solves the problem of resource allocation. It creates transparency between clients, providers, and operators, aligning incentives and granting end-users control over deployment and consumption of modular cloud services.
This is going to be a POC of the future of cloud services on web3 to be able to demonstrate buying of storage as well as configurations for virtual machines in the cloud, the products name is Cloud as a Blockchain.

This application have 3 folder structures :- 

1. caab-app :- This contains the frontend node.js code
2. caab-contract :- This contains the contracts (ERC-20, ERC-721, ERC-1155)
3. Reports :- This contains the Phase reports


To-Do:

1. Make changes in index.html - caab-app\src\index.html (For Frontend)
2. Make the contract better and more robust by adding the modifiers and events
3. Add new functions in ERC-1155 contract to include batch transfer and a function to mint ERC-1155 as well for the same.
4. Update the abi file - caab-contract\contracts\*
5. Update the app.js - caab-app\src\js\app.js
