import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const HOLESKY_PRIVATE_KEY = vars.get("PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    holesky: {
      url: "https://rpc-holesky.rockx.com",
      accounts: [HOLESKY_PRIVATE_KEY],
    }
  }
};

export default config;
