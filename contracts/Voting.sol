// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
  // TODO, make this more gamified. Like when there is a new question increment votes by 1
  uint public constant MAX_VOTES_PER_VOTER = 9999999999;
  
  struct Movie {
    uint id;
    string title;
    uint votes;
  }

  mapping (uint => Movie) public movies;
  uint public moviesCount;

  mapping(address => uint) public votes;

  event Voted();
  event NewMovie();

  constructor() {
    moviesCount = 0;
  }

  function vote(uint _movieID) public {
    // require(votes[msg.sender] < MAX_VOTES_PER_VOTER, "Voter has no votes left.");
    require(_movieID > 0 && _movieID <= moviesCount, "Movie ID is out of range.");

    votes[msg.sender]++;
    movies[_movieID].votes++;

    emit Voted();
  }

  function addMovie(string memory _title) public {
    moviesCount++;

    Movie memory movie = Movie(moviesCount, _title, 0);
    movies[moviesCount] = movie;

    emit NewMovie();
    vote(moviesCount);
  }
}
