// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);
}

contract Ballot {

    IMyToken public voteToken;

    uint256 public targetBlockNumber;

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    Proposal[] public proposals;

    mapping(address => uint256) spentVotePower;

    constructor(bytes32[] memory proposalNames, address _voteToken, uint256 _targetBlockNumber) {
        voteToken = IMyToken(_voteToken);
        targetBlockNumber = _targetBlockNumber;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposal, uint256 amount) external {
        require(votePower(msg.sender) >= amount, "Not enough vote power");

        proposals[proposal].voteCount += amount;
        spentVotePower[msg.sender] += amount;
    }

    function votePower(address account) public view returns (uint256) {
        return voteToken.getPastVotes(account, targetBlockNumber) - spentVotePower[account];
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
