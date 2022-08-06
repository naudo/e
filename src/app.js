const addRow = (id, title, cover, votes, canVote) => {
    const element = document.createElement('tr');
    canVote = true;
    element.innerHTML = `
    <tr>
    
      <td class="px-6 py-4">${title}</td>
      <td class="px-6 py-4">${votes}</td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        ${
          canVote
          ? `<a data-id="${id}" data-action="yes" href="#" class="btn-vote text-indigo-600 hover:text-indigo-900">Yes!</a> <a data-id="${id}" data-action="no" href="#" class="btn-vote text-indigo-600 hover:text-indigo-900">No!</a>`
          : 'no votes left'
        }
      </td>
    </tr>
    `;
  
    document.getElementById("questions").appendChild(element);
  }

  App = {
    account: null,
    web3Provider: null,
    contracts: {},
  
  // [...]

  init: async function() {
    if (window.ethereum) {
      // Modern dapp browsers
      App.web3Provider = window.ethereum;

      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts'});
      } catch (error) {
        console.error('User denied account access');
      }
    } else if (window.web3) {
      // Look out for injected web3.js
      App.web3Provider = window.web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider(ganacheURL);
    }

    web3 = new Web3(App.web3Provider);

    let accounts = await web3.eth.getAccounts();
    App.account = accounts[0];

    await App.initContract();
  },

  // [...]
  
    initContract: async function() {
        const response = await fetch('Voting.json');
        const data = await response.json();

        App.contracts.Voting = TruffleContract(data);
        App.contracts.Voting.setProvider(App.web3Provider);

        await App.render();
        await App.listenOnEvents();
    },

  
    bindEvents: async function() {
        const newQuestionForm = document.getElementById('form-new-question');
        newQuestionForm.addEventListener('submit', App.handleAddQuestion);
    
        const voteButtons = document.getElementsByClassName('btn-vote');
        for(var i = 0; i < voteButtons.length; i++){
          voteButtons[i].addEventListener('click', App.handleVote);
        }
    },
    
    listenOnEvents: async function() {
        const instance = await App.contracts.Voting.deployed();
    
        instance.Voted({ fromBlock: 0 }).on('data', function(event){
            App.render();
        }).on('error', console.error);
    
        instance.NewQuestion({ fromBlock: 0 }).on('data', function(event){
            console.log("new Question added");
        }).on('error', console.error);
      },
  
      render: async function() {
        document.getElementById("questions").innerHTML = "";
    
        const instance = await App.contracts.Voting.deployed();
        const questionCount = (await instance.questionCount.call()).toNumber();
        const userVotes = (await instance.votes(App.account)).toNumber();
        const noVotes = (await instance.votesNo(App.account)).toNumber();
        const yesVotes = (await instance.votesYes(App.account)).toNumber();

        const maxVotesPerUser = (await instance.MAX_VOTES_PER_VOTER.call()).toNumber();
    
        for (let i = 1; i <= questionCount; i++) {
          const question = await instance.questions.call(i);
          const questionID = question[0].toNumber();
         // const userCanVote = userVotes < maxVotesPerUser;
          const userCanVote = true;
            console.log(question)
            console.log(question["votes"].toNumber())
            votes = question["votes"].toNumber();

          addRow(
            questionID,  // ID
            question[1].toString(),  // Title
            userCanVote, // make this more gamified / rate limit here
            yesVotes + " / " + noVotes + " (" + votes + ")",

          );
    
          if (!userCanVote) {
            document.getElementById("form-new-question").remove()
          }
        }
    
        await App.bindEvents();
      },
  
      handleVote: function(event) {
        event.preventDefault();
        console.log(event);
        const questionID = parseInt(event.target.dataset.id);
        const action = event.target.dataset.action;
        console.log(action)
        actionInt = 0;
        if (action == "yes") {
            actionInt = 0;
        } else {
            actionInt = 1;
        }
    
        App.contracts.Voting.deployed().then(function(instance) {
          instance.vote(questionID, actionInt, { from: App.account }).then(function(address) {
            console.log(`Successfully voted on ${questionID}`, address);
          }).catch(function(err) {
            console.error(err);
          });
        });
    
        return false;
      },
    
      handleAddQuestion: function(event) {
        event.preventDefault();
    
        const inputs = event.target.elements;
        const title = inputs['title'].value;
        // const cover = inputs['coverUrl'].value;
    
        App.contracts.Voting.deployed().then(function(instance) {
          instance.addQuestion(title, { from: App.account }).then(function() {
            console.log(`Successfully added question ${title}`);
            event.target.reset();
          }).catch(function(err) {
            console.error(err);
          });
        }).catch(function(err) {
          console.error(err);
        });
    
        return false;
      }
    
  };
  
  window.addEventListener('load', function (event) {
    App.init();
  });
  
  