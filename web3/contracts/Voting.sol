// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping (uint => Candidate) public candidates;
    mapping (address => bool) public voters;

    uint public candidatesCount;

    event votedEvent (uint indexed candidateId);

    constructor () {
        addCandidate ("Rama");
        addCandidate ("Nick");
        addCandidate ("Jose");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        require (!voters[msg.sender], "Already voted.");
        require(
            _candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate"
        );

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit votedEvent(_candidateId);
    }

}