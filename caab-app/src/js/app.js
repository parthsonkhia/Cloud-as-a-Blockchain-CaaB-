App = {
  web3: null,
  contracts: {},
  cabaddress: "0x45aB6eD59Ff8cD6c2952A416aC4e481CE2c0F921",
  names: new Array(),
  url: "http://127.0.0.1:7545",
  chairPerson: null,
  currentAccount: null,

  init: function () {
    // $.getJSON("../proposals.json", function (data) {
    //   var proposalsRow = $("#proposalsRow");
    //   var proposalTemplate = $("#proposalTemplate");
    //
    //   for (i = 0; i < data.length; i++) {
    //     proposalTemplate.find(".card-title").text(data[i].name);
    //     proposalTemplate.find("img").attr("src", data[i].picture);
    //     proposalTemplate.find(".btn-vote").attr("data-id", data[i].id);
    //
    //     proposalsRow.append(proposalTemplate.html());
    //     App.names.push(data[i].name);
    //   }
    // });
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
     $.getJSON("../abis/CAB_ERC1155.json", function (data) {
      App.contracts.CAB = new App.web3.eth.Contract(data, App.cabaddress, {});
      console.log("CAB contract loaded");
      return App.bindEvents();

    });
    // console.log(CSTabidata);
    // const CCTabi = $.getJSON("../abis/CCT_ERC721.json", function (data) {return data;});
    // const CABabi = $.getJSON("../abis/CAB_ERC1155.json", function (data) {return data;});
    // const CSTabi = require('../abis/CST_ERC20.json');
    // const CCTabi = require('../abis/CCT_ERC721.json');
    // const CABabi = require('../abis/CAB_ERC1155.json');

    // console.log(CSTabidata);
    // App.contracts.Ballot = new App.web3.eth.Contract(App.abi, App.address, {});
    // App.contracts.CCT = new App.web3.eth.Contract(App.cctabi, App.cctaddress, {});
    // App.contracts.CAB = new App.web3.eth.Contract(App.cababi, App.cabaddress, {});
    // return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-vote", App.handleVote);
    $(document).on("click", "#win-count", App.handleWinner);
    $(document).on("click", "#register", App.handleRegister);
    $(document).on("click", "#getCSTBalance", App.handleCSTBalance);
    $(document).on("click", "#getCCTBalance", App.handleCCTBalance);
    $(document).on("click", "#getCABBalance", App.handleCABBalance);
    $(document).on("click", "#buyCSTSubmit", App.handleBuyCST);
    $(document).on("click", "#buyCCTSubmit", App.handleBuyCCT);
    $(document).on("click", "#rentCAB", App.handleRent);
    $(document).on("click", "#refreshCloudBalances", App.handleRefreshCloudBalances);
    $(document).on("click", "#refreshNFTS", App.handleRefreshNFTS);
  },

  populateAddress: async function () {
    const userAccounts = await App.web3.eth.getAccounts();
    App.handler = userAccounts[0];
    document.getElementById("currentUserAddress").innerText =
          "Current User Address: " + App.handler;
  },

  handleRegister: function () {
    var option = { from: App.handler };
    App.contracts.Ballot.methods
      .register()
      .send(option)
      .on("receipt", (receipt) => {
        toastr.success("Success! Address: " + App.handler + " has been registered.");
      })
      .on("error", (err) => {
        toastr.error(App.getErrorMessage(err), "Reverted!");
      });
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
  handleVote: function (event) {
    event.preventDefault();
    var proposalId = parseInt($(event.target).data("id"));

    var option = { from: App.handler };
    App.contracts.Ballot.methods
      .vote(proposalId)
      .send(option)
      .on("receipt", (receipt) => {
        toastr.success("Success! Vote has been casted.");
      })
      .on("error", (err) => {
        toastr.error(App.getErrorMessage(err), "Reverted!");
      });
  },

  handleWinner: function () {
    App.contracts.Ballot.methods
      .reqWinner()
      .call()
      .then((winner) => {
        toastr.success(App.names[winner] + " is the winner!");
      })
      .catch((err) => {
        toastr.error(
          "A proposal must have greater than 2 votes to be declared as winner.",
          "Error insufficient votes!"
        );
      });
  },

  getErrorMessage: function (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    let errorReason = "";

    if (errorCode === 4001) {
      return "User rejected the request!";
    } else if (
      errorMessage.includes("Access Denied: user is not the chairperson!")
    ) {
      return "Access Denied: user is not the chairperson!";
    } else if (errorMessage.includes("Access Denied: Not a Registered Voter")) {
      return "Access Denied: Not a Registered Voter!";
    } else if (
      errorMessage.includes("Vote Denied: This user has already casted a vote!")
    ) {
      return "Vote Denied: This user has already casted a vote!";
    } else if (
      errorMessage.includes(
        "Invalid Vote: The vote proposal entered is invalid!"
      )
    ) {
      return "Invalid Vote: The vote proposal entered is invalid!";
    } 
    else if (
      errorMessage.includes(
        "Access Denied: User has been registered already!"
      )
    ) {
      return "Access Denied: User has been registered already!";
    }else {
      return "Unexpected Error!";
    }
  },

  handleBuyCST() {
    console.log("buy CST")
    console.log(typeof(parseInt(document.getElementById('cstquantity').value)))
    var option = { from: App.handler };
    App.contracts.CAB.methods.buyCST(parseInt(document.getElementById('cstquantity').value))
        .send(option)
        .on("receipt", (receipt) => {
          toastr.success("Transaction Successful: " + App.handler + ".");
        })
        .on("error", (err) => {
          toastr.error(App.getErrorMessage(err), "Reverted!");
        });
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
  handleBuyCCT() {
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
    var formData = {
      gpu: gpu,
      processor: processor,
      ram: ram,
      cores: cores,
      os: os,
      image: image
    };
    var option = { from: App.handler };
    App.contracts.CAB.methods.buyCCT(...Object.values(formData))
        .send(option)
        .on("receipt", (receipt) => {
          toastr.success("Transaction Successful: " + App.handler + ".");
        })
        .on("error", (err) => {
          toastr.error(App.getErrorMessage(err), "Reverted!");
        });

    // Log the form data to the console (you can do something else with it)
    console.log(formData);
  },
  handleRent() {
    var option = { from: App.handler };
    App.contracts.CAB.methods.transferTokensToOwner(
        parseInt(document.getElementById('cctTokenID').value),
        parseInt(document.getElementById('cstAmount').value)/5).send(option)
        .on("receipt", (receipt) => {
          toastr.success("Transaction Successful: " + App.handler + ".");
        })
        .on("error", (err) => {
          toastr.error(App.getErrorMessage(err), "Reverted!");
        });
  },
  handleRefreshCloudBalances() {
    console.log("refresh cloud balances")
  },
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
