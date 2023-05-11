import AAVEpoolABI from '../../abi/AAVEpool.json'
import erc20ABI from '../../abi/ERC20.json'
import {daiAddress, usdcAddress, AAVEpool_address} from '../../utils/address'
import Simulator from "../../engine/simulator";
import {MyAgent, MyContractFactory, Token } from "../../utils/types"
import AgentLender from "./agents/lenderAgent";
import AgentBorrower from "./agents/borrowerAgent";
import { ethers } from 'hardhat';

export default async function main() {

  const contracts: MyContractFactory[] = [
    {name: 'AAVEpool', address: AAVEpool_address, abi: AAVEpoolABI},
    {name: 'tokenA', address: daiAddress, abi: erc20ABI},
    {name: 'tokenB', address: usdcAddress, abi: erc20ABI},
    {name: 'atoken', address: '0x67550Df3290415611F6C140c81Cd770Ff1742cb9', abi: erc20ABI},
    {name: 'stableDebtToken', address: '0x67550Df3290415611F6C140c81Cd770Ff1742cb9', abi: erc20ABI},
    {name: 'variableDebtToken', address: '0x3600d5D4Ba52D4ae4327DD7cB1437bF56eEE6A76', abi: erc20ABI},
  ]
  // define quantity of tokens needed my each agent
  // WARNING: names have to be the same as your contarcts
  let tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 100},
    {name: 'tokenB', decimals: 6, amount: 100}
  ]
  // agent types and number of each type that will be used within the simulation
  let agents: MyAgent[] = [
    // {'type': AgentLender, nb: 1},
    {'type': AgentBorrower, nb: 1}
  ]
  // simulation parameters
  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: agents,
    trackedResults: [0,0],
    contracts: contracts,
    tokens: tokens
  }
  // Start the simulation using params
  new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
