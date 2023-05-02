import { ethers } from "hardhat"
import AAVEpoolABI from '../../abi/AAVEpool.json'
import erc20ABI from '../../abi/ERC20.json'
import {daiAddress, usdcAddress, AAVEpool_address} from '../../utils/address'
import Simulator from "../../engine/simulator";
import {MyContractFactory } from "../../engine/types"

export default async function main() {

  const contracts: MyContractFactory[] = [
    {name: 'AAVEpool', address: AAVEpool_address, abi: AAVEpoolABI},
    {name: 'tokenA', address: daiAddress, abi: erc20ABI},
    {name: 'tokenB', address: usdcAddress, abi: erc20ABI},
  ]

  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agentNb: 1,
    trackedResults: [0,0],
    contracts: contracts
  }

  const simulator = new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
