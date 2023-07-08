import Simulator from "../../engine/simulator";
import {MyAgent, MyContractFactory, Token } from "../../utils/types"
import AgentBorrower from "./agents/borrowerAgent";
import * as abi from '../../constants/abi'
import * as address from '../../constants/address'

export default async function main() {

  const contracts: MyContractFactory[] = [
    {name: 'AAVEpool', address: address.AAVE_POOL, abi: abi.AAVE_POOL},
    {name: 'AAVEOracle', address: address.AAVE_ORACLE, abi: abi.AAVE_ORACLE},
    {name: 'tokenA', address: address.DAI_AAVE, abi: abi.ERC20},
    {name: 'tokenB', address: address.USDC_AAVE, abi: abi.ERC20},
    {name: 'atoken', address: address.ATOKEN_AAVE, abi: abi.ERC20},
    {name: 'stableDebtToken', address: address.STABLE_DEBT_TOKEN_AAVE, abi: abi.ERC20},
    {name: 'variableDebtToken', address: address.VARIABLE_DEBT_TOKEN_AAVE, abi: abi.ERC20},
  ]
  // define quantity of tokens needed my each agent
  // WARNING: names have to be the same as your contarcts
  let tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 1000},
    {name: 'tokenB', decimals: 6, amount: 1000}
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
    tokens: tokens,
    marketPrice: [],
    parentPort: null,
  }
  // Start the simulation using params
  const _simulator = new Simulator(params)
  await _simulator.init(true, true, true, contracts, agents);
  await _simulator.start();
}

main()
.catch((error) => console.error("Error simulating scenario: ", error))
