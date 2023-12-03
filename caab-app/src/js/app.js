
App = {
  web3: null,
  contracts: {},
  cabaddress: "0x6b04d0cA21f79b7F3B6a74b76047b67390cf5285",
  names: new Array(),
  url: "http://127.0.0.1:8545",
  chairPerson: null,
  currentAccount: null,

  init: function () {

    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3 = new Web3(Web3.givenProvider);
    } else {
      App.web3 = new Web3(App.url);
    }
    // App.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    ethereum.request({ method: "eth_requestAccounts" });

    App.populateAddress();

    return App.initContract();
  },

  initContract: function () {
     $.getJSON("../abis/CloudAsABlockchainToken.json", function (data) {
       console.log(data)
      App.contracts.CAB = new App.web3.eth.Contract(data.abi, App.cabaddress, {});
      console.log("CAB contract loaded");
      App.listenToEvents();
      return App.bindEvents();

    });

  },
  listenToEvents: function () {
    App.contracts.CAB.events.PurchaseReceipt()
        .on('data', event => toastr.success("Event emitted " +event.returnValues[0] + " bought " + event.returnValues[1]) )
        .on('changed', changed => console.log(changed))
        .on('error', err => console.log(err))
        .on('connected', str => console.log(str))
    App.contracts.CAB.events.rentalSuccess().on('data', event => toastr.success("Event emitted " +event.returnValues[0]))
  },

  bindEvents: function () {
    // $(document).on("click", ".btn-vote", App.handleVote);
    // $(document).on("click", "#win-count", App.handleWinner);
    // $(document).on("click", "#register", App.handleRegister);
    $(document).on("click", "#getCSTBalance", App.handleCSTBalance);
    $(document).on("click", "#getCCTBalance", App.handleCCTBalance);
    $(document).on("click", "#getCABBalance", App.handleCABBalance);
    $(document).on("click", "#buyCSTSubmit", App.handleBuyCST);
    $(document).on("click", "#buyCCTSubmit", App.handleBuyCCT);
    $(document).on("click", "#rentCABSubmit", App.handleRent);
    $(document).on("click", "#refreshCloudBalances", App.handleRefreshCloudBalances);
    $(document).on("click", "#refreshNFTS", App.handleRefreshNFTS);
    // App.contracts.CAB.events.NFTminted()
    //     .on('data', (event) => {
    //       console.log('Event data:', event.returnValues);
    //       // Handle the event data here
    //     })
    //     .on('error', console.error);
  },

  populateAddress: async function () {
    const userAccounts = await App.web3.eth.getAccounts();
    App.handler = userAccounts[0];
    document.getElementById("currentUserAddress").innerText =
          "Current User Address: " + App.handler;
  },


  handleCSTBalance: function () {
    console.log("handleCSTBalance")
    var option = { from: App.handler };
    App.contracts.CAB.methods.getCSTBalance(App.handler)
        // .then((error,data)=>{console.log(data);})
        .call((error, balance) => {
          if (!error) {
            document.getElementById("currentCSTBalance").innerText =
                balance;
            console.log(`Balance of ${App.handler}: ${balance}`);
          } else {
            console.error(error);
          }}
        );
      // .on("receipt", (receipt) => {
      //   toastr.success("Success! Address: " + App.handler + " has been registered.");
      // })
      // .on("error", (err) => {
      //   toastr.error(App.getErrorMessage(err), "Reverted!");
      // });
  },
  handleCCTBalance: function () {
    App.contracts.CCT.methods.balanceOf(App.handler).call((error, balance) => {
      if (!error) {
        document.getElementById("currentCCTBalance").innerText =
            balance;
        console.log(`Balance of ${App.handler}: ${balance}`);
      } else {
        console.error(error);
      }}
    );
  },
  handleCABBalance: function () {
    App.contracts.CAB.methods.balanceOf(App.handler).call((error, balance) => {
      if (!error) {
        document.getElementById("currentCABBalance").innerText =
            balance;
        console.log(`Balance of ${App.handler}: ${balance}`);
      } else {
        console.error(error);
      }}
    );
  },

  handleBuyCST() {
    console.log("buy CST")
    console.log(typeof(parseInt(document.getElementById('cstquantity').value)))
    var option = { from: App.handler };
    try{
    App.contracts.CAB.methods.buyCST(parseInt(document.getElementById('cstquantity').value))
        .send(option)
        .on("receipt", (receipt) => {
          toastr.success("Transaction Successful: " + App.handler + ".");
        })
        .on("error", (err) => {
          toastr.error(App.getErrorMessage(err), "Reverted!");
        }).then((result) => {
      // This block will be executed after the transaction is successful
      // toastr.success("Transaction Successful for: " + App.handler + ".");
    });

    }catch(err){
      toastr.error(App.getErrorMessage(err), "Reverted!");
    }
  },
  handleFileSelect(configData){


    console.log(response)
    return response
    // Display the file name

  },
  uuid() {
    return ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, c => (
        c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  },
  pinFileToIPFS(src, configData) {
    const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ZDUzNDU2Mi0xZDM4LTQzZDQtYjY2Mi03ZmIwYmNmMmZiMjEiLCJlbWFpbCI6InBzb25raGlhQGJ1ZmZhbG8uZWR1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImVjNTM1ZWJiMWMwM2JiOGMxMTUwIiwic2NvcGVkS2V5U2VjcmV0IjoiNDdiOWYzYjVkYTY5NDM2M2VhNmFlMWQyMDEzZTcwYTEzNzAyZjc5YWI3ZDdkZmI0NWNkMjk3MWQ2ZWZjN2MwZCIsImlhdCI6MTcwMTQ3MzQwNn0.DJfvrp7IeAYP5jc3XbFxkTxL0vgzH4FGXNQFWim_CT4'

    const formData = new FormData();
    formData.append('file', src)
    const pinataMetadata = JSON.stringify({
      name: crypto.randomUUID(),
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      }).then(res=>{
        console.log(res.data);
        //Create json file with response
        var json = {
          "name": res.data.IpfsHash,
            "description": "This is just a test",
            "image": "https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash,
            "dna": "01",
            "edition": 1,
            "date": 1672523652840,
            "properties": {
              "description": {
                "type": "string",
                "description": JSON.stringify(configData)
              }
            },
            "attributes": [
                  {
                    "trait_type": "test_image_1",
                    "value": "test_1"
                  }
              ]
        }
        var jsonstr = JSON.stringify(json);
        var blob = new Blob([jsonstr], {type: "application/json"});

        const formData = new FormData();
        formData.append('file', blob)
        const pinataMetadata = JSON.stringify({
          name: crypto.randomUUID()+".json",
        });
        formData.append('pinataMetadata', pinataMetadata);

        const pinataOptions = JSON.stringify({
          cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions);

        const res1 = axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          maxBodyLength: "Infinity",
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'Authorization': `Bearer ${JWT}`
          }
        }).then(res=>{
            console.log("returning file link");
            console.log("https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash);
            return "https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash;
        })
        // var url  = URL.createObjectURL(blob);


      });
      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  },

  createCard(data) {
    var card = document.createElement('div');
    card.className = 'col-md-4';

    var cardContent = `
              <div class="card">
                  <div class="card-body">
          `;

    // Define attribute order
    var attributesOrder = ['Token id', 'gpu', 'processor', 'ram', 'cores', 'os', 'imageUrl'];

    // Populate card content
    for (var i = 0; i < attributesOrder.length; i++) {
      var attribute = attributesOrder[i];
      var value = data[i];

      if (attribute === 'imageUrl') {
        cardContent = `<img src="${value}" class="card-img-top" alt="Image">`+ cardContent;
      } else {
        cardContent += `<p class="card-text">${attribute}: ${value}</p>`;
      }
    }

    cardContent += `
                  </div>
              </div>
          `;

    card.innerHTML = cardContent;
    return card;
  },
  handleBuyCCT : async function() {
    console.log("buy CCT")
    var form = document.getElementById('buyCCTForm');

    // Get form elements
    var gpu = form.elements['gpu'].value;
    var processor = form.elements['processor'].value;
    var ram = form.elements['ram'].value;
    var cores = form.elements['cores'].value;
    var os = form.elements['os'].value;
    var image = form.elements['image'].value;
    // Create an object with the form data

    var input = document.getElementById('image');
    var file = input.files[0];
    // var response = App.pinFileToIPFS(file, formData);

    const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ZDUzNDU2Mi0xZDM4LTQzZDQtYjY2Mi03ZmIwYmNmMmZiMjEiLCJlbWFpbCI6InBzb25raGlhQGJ1ZmZhbG8uZWR1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImVjNTM1ZWJiMWMwM2JiOGMxMTUwIiwic2NvcGVkS2V5U2VjcmV0IjoiNDdiOWYzYjVkYTY5NDM2M2VhNmFlMWQyMDEzZTcwYTEzNzAyZjc5YWI3ZDdkZmI0NWNkMjk3MWQ2ZWZjN2MwZCIsImlhdCI6MTcwMTQ3MzQwNn0.DJfvrp7IeAYP5jc3XbFxkTxL0vgzH4FGXNQFWim_CT4'

    const formData1 = new FormData();
    formData1.append('file', file)
    const pinataMetadata = JSON.stringify({
      name: crypto.randomUUID(),
    });
    formData1.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData1.append('pinataOptions', pinataOptions);

    try{
      const res = axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData1, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData1._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      }).then(res=>{
        console.log(res.data);
        var imageUrl = "https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash;
        //Create json file with response
        var json = {
          "name": res.data.IpfsHash,
          "description": "This is just a test",
          "image": "https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash,
          "dna": "01",
          "edition": 1,
          "date": 1672523652840,
          "properties": {
            "description": {
              "type": "string",
              "description": JSON.stringify({
                gpu: gpu,
                processor: processor,
                ram: ram,
                cores: cores,
                os: os})
            }
          },
          "attributes": [
            {
              "trait_type": "test_image_1",
              "value": "test_1"
            }
          ]
        }
        var jsonstr = JSON.stringify(json);
        var blob = new Blob([jsonstr], {type: "application/json"});

        const formData2 = new FormData();
        formData2.append('file', blob)
        const pinataMetadata = JSON.stringify({
          name: crypto.randomUUID()+".json",
        });
        formData2.append('pinataMetadata', pinataMetadata);

        const pinataOptions = JSON.stringify({
          cidVersion: 0,
        })
        formData2.append('pinataOptions', pinataOptions);

        const res1 = axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData2, {
          maxBodyLength: "Infinity",
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData2._boundary}`,
            'Authorization': `Bearer ${JWT}`
          }
        }).then(res=>{
          console.log("returning file link");
          console.log("https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash);
          var formData = {
            gpu: gpu,
            processor: processor,
            ram: ram,
            cores: cores,
            os: os,
            image: imageUrl,
            uri: "https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash
          };
          var option = { from: App.handler };
          App.contracts.CAB.methods.buyCCT(...Object.values(formData))
              .send(option)
              .on("receipt", (receipt) => {
                console.log(receipt)
                toastr.success("Transaction Successful: " + App.handler + ".");
              })
              .on("error", (err) => {
                console.log(err)
                toastr.error(err, "Reverted!");
              }).then((result) => {
            toastr.success("Transaction Successful for: " + App.handler + ".");
          });
          // return "https://scarlet-tiny-penguin-197.mypinata.cloud/ipfs/"+res.data.IpfsHash;
        })


      });
    } catch (error) {
      console.log(error);
    }


    // Log the form data to the console (you can do something else with it)
  },
  handleRent() {
    var option = { from: App.handler };
    App.contracts.CAB.methods.rentCloudDiskandServer(
        parseInt(document.getElementById('cctTokenID').value),
        parseInt(document.getElementById('cstAmount').value)/5).send(option)
        .on("receipt", (receipt) => {
          toastr.success("Transaction Successful: " + App.handler + ".");
        })
        .on("error", (err) => {
          console.log(err)
          toastr.error(err, "Reverted!");
        });
  },
  handleRefreshCloudBalances() {
    console.log("refresh cloud balances")
    var option = { from: App.handler };
    App.contracts.CAB.methods.getRentalDetails(App.handler).call()
        .then((data) => {
          console.log(data);
          // var storagevar = document.getElementById("userstoragebalance");
          // var storagerented = data[0].cstAmount*5;
          // storagevar.textContent = storagerented;
          var tableBody = document.querySelector("#myTable tbody");
          tableBody.innerHTML = "";
          for (let i = 0; i < data.length; i++) {
            App.contracts.CAB.methods.getTokenDetails(data[i].cctTokenID).call()
              .then((data1) => {
                console.log(data1);
                var row = tableBody.insertRow();
                row.innerHTML = "<td>" + (i+1) + "</td><td>" + (data[i].cstAmount*5) + "GB</td><td>" + data1.gpu + "</td><td>" + data1.processor + "</td><td>" + data1.ram + "</td><td>" + data1.cores + "</td><td>" + data1.os + "</td>";
              });
          }
        })


        // .on("receipt", (receipt) => {
      // toastr.success("Success! Address: " + App.handler + " has been registered.");
      // console.log(receipt)
    // }).on("error", (err) => {
    //       toastr.error(App.getErrorMessage(err), "Reverted!");
    //     });
    // App.contracts.CAB.methods.getDiskStorageRented(App.handler).send(option).on("receipt", (receipt) => {
    //   toastr.success("Success! Address: " + App.handler + " has been registered.");
    //   console.log(receipt)
    // }).on("error", (err) => {
    //   toastr.error(App.getErrorMessage(err), "Reverted!");
    // });
  }
  ,
  handleRefreshNFTS() {
    console.log("refresh NFTs")
    App.contracts.CAB.methods.getConfigDetails(App.handler).call((error, data) => {
      console.log(data)

      var cardsContainer = document.getElementById('cards-container');
      cardsContainer.innerHTML = '';
      for (var i = 0; i < data.length; i++) {
        var cardData = data[i];
        var card = App.createCard(cardData);
        cardsContainer.appendChild(card);
      }
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: "toast-bottom-full-width",
      preventDuplicates: false,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  });
});

/* Detect when the account on metamask is changed */
window.ethereum.on("accountsChanged", () => {
  App.populateAddress();
});

/* Detect when the network on metamask is changed */
window.ethereum.on("chainChanged", () => {
  App.populateAddress();
});
