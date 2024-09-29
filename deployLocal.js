const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

async function main() {
  // Connect to the Ethereum network
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // Set up the signer (contract owner)
  const privateKey = process.env.PRIVATE_KEY;
  const signer = new ethers.Wallet(privateKey, provider);

  // Contract address and ABI
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  // Read and parse the ABI from the JSON file
  const abiPath = path.join(__dirname, 'artifacts', 'contracts', 'SamoyedCoin.sol', 'Samoyedcoin.json');
  const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const abi = contractJson.abi;

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Address of the airdrop contract
  const airdropContractAddress = process.env.AIRDROP_CONTRACT_ADDRESS;
  console.log(airdropContractAddress);

  try {
    // Call setAirdropContract function
    const tx = await contract.setAirdropContract(airdropContractAddress);
    console.log("Transaction sent:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Airdrop contract set successfully!");
  } catch (error) {
    console.error("Error setting airdrop contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });