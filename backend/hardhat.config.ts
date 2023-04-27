import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
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
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.GOERLI_URL as string,
      },
      chainId: 5,
      // gasPrice: 1,
      // gas: 100000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string
  }
};

export default config;
