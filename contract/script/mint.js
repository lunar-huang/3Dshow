import { network } from "hardhat";

  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();

    const contract = await ethers.getContractAt("CollectibleCard", CONTRACT_ADDRESS, deployer);

    const tx = await contract.mintToIssuer(1);
    await tx.wait();

    console.log("Minted token to issuer");
    console.log("Issuer:", deployer.address);
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
