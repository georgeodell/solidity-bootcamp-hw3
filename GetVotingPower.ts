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
  else if (parameters.length > 2) throw new Error("Too many arguments");

  const ballotContractAddress = parameters[0];
  const accountAddress = parameters[1];

  console.log("Getting voting power");
  console.log(`Ballot Contract Address: ${ballotContractAddress}`);
  console.log(`Account Address: ${accountAddress}`);

  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = ballotContractFactory.connect(signer).attach(ballotContractAddress) as Ballot;

  const votingPower = await ballotContract.votePower(accountAddress);

  console.log(
    `${accountAddress} has ${votingPower} voting power`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});