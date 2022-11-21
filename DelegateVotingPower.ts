import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BytesLike, ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = ethers.getDefaultProvider("goerli", {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY
  });

  const seed = process.env.MNEMONIC;
  const pKey = process.env.PRIVATE_KEY_2 as string; // change delegator here

  // const wallet = ethers.Wallet.fromMnemonic(seed ?? "");
  const wallet = new ethers.Wallet(pKey);

  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();

  const delegatorAddress = await signer.getAddress();

  const args = process.argv;
  const parameters = args.slice(2);

  if (parameters.length <= 0) throw new Error("Not enough arguments");
  else if (parameters.length > 3) throw new Error("Too many arguments");

  const contractAddress = parameters[0];
  const delegateeAddress = parameters[1];

  console.log("Delegating vote tokens");
  console.log(`Token Contract Address: ${contractAddress}`);
  console.log(`Delegatee Address: ${delegateeAddress}`);

  const tokenContractFactory = new MyToken__factory(signer);
  const tokenContract = tokenContractFactory.connect(signer).attach(contractAddress) as MyToken;

  const delegateTx = await tokenContract.delegate(delegateeAddress);
  await delegateTx.wait();

  console.log(
    `${delegatorAddress} delegated their tokens to ${delegateeAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});