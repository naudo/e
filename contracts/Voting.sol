// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Voting {
  // TODO, make this more gamified. Like when there is a new question increment votes by 1
  uint public constant MAX_VOTES_PER_VOTER = 9999999999;
  
  struct Question {
    uint id;
    string title;
    uint votes;
    uint votesNo;
    uint votesYes;
  }

  enum ValidActions { YES, NO }

  mapping (uint => Question) public questions;
  uint public questionCount;
  

  mapping(address => uint) public votes;
  mapping(address => uint) public votesNo;
  mapping(address => uint) public votesYes;


  event Voted();
  event NewQuestion();
  event VotedNo();
  event VotedYes();

  constructor() {
    questionCount = 0;
  }

  function vote(uint _questionID, uint _action) public {
    // require(votes[msg.sender] < MAX_VOTES_PER_VOTER, "Voter has no votes left.");
    require(_questionID > 0 && _questionID <= questionCount, "Question ID is out of range.");
    ValidActions action = ValidActions(_action);

    if(action == ValidActions.YES) {
      votesYes[msg.sender]++;
      emit VotedYes();
    } else if (action == ValidActions.NO) {
      votesNo[msg.sender]++;
      emit VotedNo();
    }

    votes[msg.sender]++;
    questions[_questionID].votes++;

    emit Voted();
  }

  function addQuestion(string memory _title) public {
    questionCount++;

    Question memory question = Question(questionCount, _title, 0, 0, 0); // votes, yes, no
    questions[questionCount] = question;

    emit NewQuestion();
  }


}
