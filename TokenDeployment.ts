import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BytesLike, ethers } from "ethers";
import * as dotenv from "dotenv";
import { MyToken, MyToken__factory } from "../typechain-types";
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

    const tokenContractFactory = new MyToken__factory(signer);
    const tokenContract = await tokenContractFactory.deploy() as MyToken;
    await tokenContract.deployed();

    console.log(
        `The token contract was deployed at the address ${tokenContract.address}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});