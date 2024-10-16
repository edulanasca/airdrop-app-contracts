import { ethers } from "hardhat";

async function main() {
    const signer = await ethers.provider.getSigner();
    const balance = await ethers.provider.getBalance(await signer.getAddress())
    console.log(ethers.formatEther(balance))
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
