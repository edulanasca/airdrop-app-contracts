import { ethers } from "hardhat";

async function main() {
  const SamoyedCoin = await ethers.getContractFactory("Samoyedcoin");
  
  // Get the account that will deploy the contract
  const [deployer] = await ethers.getSigners();

  // Estimate gas for deployment
  const estimatedGas = await ethers.provider.estimateGas(
    await SamoyedCoin.getDeployTransaction(deployer.address)
  );

  // Get current gas price
  const gasPrice = await ethers.provider.getFeeData();

  console.log(gasPrice)
  // Calculate deployment cost
  const deploymentCost = estimatedGas * (gasPrice.gasPrice ?? BigInt(0));

  console.log(`Estimated gas: ${estimatedGas.toString()}`);
  console.log(`Current gas price: ${ethers.formatUnits(gasPrice.gasPrice ?? 0, "gwei")} gwei`);
  console.log(`Estimated deployment cost: ${ethers.formatEther(deploymentCost)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });