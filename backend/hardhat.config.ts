import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import 'hardhat-test-utils';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_URL as string,
      },
      // gasPrice: 20000000000 // 20 gwei
    },
    testnet: {
      url:  process.env.ALCHEMY_URL as string,
      accounts: [process.env.PRIVATE_KEY as string],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

