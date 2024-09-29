import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SamoyedCoinModule = buildModule("SamoyedCoinModule", (m) => {
  // Get the deployer's address
  const deployer = m.getAccount(0);

  // Deploy the SamoyedCoin contract
  const samoyedCoin = m.contract("Samoyedcoin", [deployer]);

  return { samoyedCoin };
});

export default SamoyedCoinModule;