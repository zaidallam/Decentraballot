// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Contest {
    struct Voter {
        uint vote;
        uint weight;
        address delegatedTo;
        bool hasVoted;
    }

    struct Candidate {
        bytes32 name;
        uint voteCount;
    }

    address public creator;
    mapping(address => Voter) public voters;
    Candidate[] public candidates;

    constructor(bytes32[] memory candidateNames, address creatorAddress) {
        creator = creatorAddress;
        voters[creator].weight = 1;

        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    modifier creatorOnly {
        require(
            msg.sender == creator,
            "This operation is only accessible to this contest's creator"
        );
        _;
    }

    function giveRightToVote(address voter) external creatorOnly {
        require(
            voters[voter].weight == 0,
            "This address has already been granted the right to vote"
        );
        voters[voter].weight = 1;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function delegate(address delegateAddress) external {
        Voter storage voter = voters[msg.sender];
        
        require(!voter.hasVoted, "This address has already voted");
        require(delegateAddress != msg.sender, "Self-delegation is not allowed");

        while (voters[delegateAddress].delegatedTo != address(0)) {
            delegateAddress = voters[delegateAddress].delegatedTo;

            require(
                delegateAddress != msg.sender,
                "Delegating to this person will create a delegation loop"
            );
        }

        Voter storage chosenDelegate = voters[delegateAddress];

        require(
            chosenDelegate.weight >= 1,
            "The chosen delegate has not been granted the right to vote"
        );

        voter.hasVoted = true;
        voter.delegatedTo = delegateAddress;
        chosenDelegate.weight += voter.weight;
        if (chosenDelegate.hasVoted) {
            candidates[chosenDelegate.vote].voteCount += voter.weight;
        }
    }

    function vote(uint candidateID) external {
        Voter storage voter = voters[msg.sender];

        require(voter.weight != 0, "This address has no right to vote in this contest");
        require(!voter.hasVoted, "This address has already voted");
        
        voter.hasVoted = true;
        voter.vote = candidateID;

        candidates[candidateID].voteCount += voter.weight;
    }

    function winnerID() public view returns (uint candidateID)
    {
        uint winningVoteCount = 0;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                candidateID = i;
            }
        }
    }

    function winnerName() external view returns (bytes32 candidateName)
    {
        candidateName = candidates[winnerID()].name;
    }
}

contract Decentraballot {
    struct ContestIdentity {
        bytes32 identifier;
        string description;
        address contractAddress;
    }

    mapping(bytes32 => ContestIdentity) public contests;

    function createContest(bytes32 identifier, string calldata description, bytes32[] calldata candidates) external {
        require (contests[identifier].contractAddress == address(0), "Contest with given identifier already exists");

        contests[identifier] = ContestIdentity(
            {
                identifier: identifier,
                contractAddress: address(new Contest(candidates, msg.sender)),
                description: description
            }
        );
    }

    function getContestAddress(bytes32 identifier) external view returns (address) {
        require (contests[identifier].contractAddress != address(0), "Contest with given identifier does not exist");
        
        return contests[identifier].contractAddress;
    }

    function getContestDescription(bytes32 identifier) external view returns (string memory) {
        require (contests[identifier].contractAddress != address(0), "Contest with given identifier does not exist");

        return contests[identifier].description;
    }
}