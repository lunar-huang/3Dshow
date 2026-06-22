import { network } from "hardhat";

  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const USER_ADDRESS = "0x3938af0d683C27f1C60cDDf0c1A8f2804152bc5F";

  async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();

    const contract = await ethers.getContractAt("CollectibleCard", CONTRACT_ADDRESS, deployer);

    const tx = await contract.claimTo(USER_ADDRESS, 0);
    await tx.wait();

    console.log("Claimed token 0 to:", USER_ADDRESS);
  }
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
