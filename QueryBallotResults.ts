import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BytesLike, ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = ethers.getDefaultProvider("goerli", {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY
  });

  const seed = process.env.MNEMONIC;
  const pKey = process.env.PRIVATE_KEY_1 as string;

  // const wallet = ethers.Wallet.fromMnemonic(seed ?? "");
  const wallet = new ethers.Wallet(pKey);

  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  
  const voterAddress = await signer.getAddress();

  const args = process.argv;
  const parameters = args.slice(2);

  if (parameters.length <= 0) throw new Error("Not enough arguments");
  else if (parameters.length > 1) throw new Error("Too many arguments");

  const contractAddress = parameters[0];

  console.log("Retrieving the winning proposal");
  console.log(`Contract Address: ${contractAddress}`);

  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = ballotContractFactory.connect(signer).attach(contractAddress) as Ballot;

  const winningProposalIndex = await ballotContract.winningProposal();
  const winningProposal = await ballotContract.proposals(winningProposalIndex);

  const winnerName = ethers.utils.parseBytes32String(winningProposal.name);
  const winnerVoteCount = winningProposal.voteCount;

  console.log(
    `${winnerName} won with ${winnerVoteCount} votes`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});