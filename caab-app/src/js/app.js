App = {
  web3: null,
  contracts: {},
  address: "0x3af7286d20114e40993bb149abadC3DAF40DD263",
  names: new Array(),
  url: "http://127.0.0.1:7545",
  chairPerson: null,
  currentAccount: null,

  init: function () {
    $.getJSON("../proposals.json", function (data) {
      var proposalsRow = $("#proposalsRow");
      var proposalTemplate = $("#proposalTemplate");

      for (i = 0; i < data.length; i++) {
        proposalTemplate.find(".card-title").text(data[i].name);
        proposalTemplate.find("img").attr("src", data[i].picture);
        proposalTemplate.find(".btn-vote").attr("data-id", data[i].id);

        proposalsRow.append(proposalTemplate.html());
        App.names.push(data[i].name);
      }
    });
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3 = new Web3(Web3.givenProvider);
    } else {
      App.web3 = new Web3(App.url);
    }
    ethereum.request({ method: "eth_requestAccounts" });

    App.populateAddress();
    return App.initContract();
  },

  initContract: function () {
    App.contracts.Ballot = new App.web3.eth.Contract(App.abi, App.address, {});
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-vote", App.handleVote);
    $(document).on("click", "#win-count", App.handleWinner);
    $(document).on("click", "#register", App.handleRegister);
  },

  populateAddress: async function () {
    const userAccounts = await App.web3.eth.getAccounts();
    App.handler = userAccounts[0];
    document.getElementById("currentUserAddress").innerText =
          "Current User Address: " + App.handler;

    // new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts(
    //   (err, accounts) => {
    //     document.getElementById("currentUserAddress").innerText =
    //       "Current User Address: " + App.handler;
    //     jQuery("#enter_address").empty();
    //     for (let i = 0; i < accounts.length; i++) {
    //       if (App.handler != accounts[i]) {
    //         var optionElement =
    //           '<option value="' + accounts[i] + '">' + accounts[i] + "</option";
    //         jQuery("#enter_address").append(optionElement);
    //       }
    //     }
    //   }
    // );
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

  abi: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "numProposals",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "register",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reqWinner",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "winningProposal",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "toProposal",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
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
