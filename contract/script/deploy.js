import { network } from "hardhat";

  async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();

    console.log("Deploying with:", deployer.address);

    const contract = await ethers.deployContract("CollectibleCard", [deployer.address]);
    await contract.waitForDeployment();

    console.log("CollectibleCard deployed to:", await contract.getAddress());
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
