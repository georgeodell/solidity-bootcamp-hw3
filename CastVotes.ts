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
  const pKey = process.env.PRIVATE_KEY_2 as string; // change voter here

  // const wallet = ethers.Wallet.fromMnemonic(seed ?? "");
  const wallet = new ethers.Wallet(pKey);

  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();

  const voterAddress = await signer.getAddress();

  const args = process.argv;
  const parameters = args.slice(2);

  if (parameters.length <= 0) throw new Error("Not enough arguments");
  else if (parameters.length > 3) throw new Error("Too many arguments");

  const ballotContractAddress = parameters[0];
  const proposalIndex = parameters[1];
  const votingAmount = parameters[2];

  console.log("Casting votes");
  console.log(`Ballot Contract Address: ${ballotContractAddress}`);
  console.log(`Voter Address: ${voterAddress}`);
  console.log(`Proposal: ${proposalIndex}`);
  console.log(`Voting Amount: ${votingAmount}`);

  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = ballotContractFactory.connect(signer).attach(ballotContractAddress) as Ballot;

  const voteTx = await ballotContract.vote(proposalIndex, votingAmount);
  await voteTx.wait();

  const proposal = await ballotContract.proposals(proposalIndex);
  const proposalName = ethers.utils.parseBytes32String(proposal.name);

  console.log(
    `${voterAddress} cast ${votingAmount} votes for ${proposalName}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});