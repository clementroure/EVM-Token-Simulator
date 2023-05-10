import AAVEpoolABI from '../../abi/AAVEpool.json'
import erc20ABI from '../../abi/ERC20.json'
import {daiAddress, usdcAddress, AAVEpool_address} from '../../utils/address'
import Simulator from "../../engine/simulator";
import {MyAgent, MyContractFactory } from "../../engine/types"
import AgentLender from "./agents/lenderAgent";
import AgentBorrower from "./agents/borrowerAgent";

export default async function main() {

  const contracts: MyContractFactory[] = [
    {name: 'AAVEpool', address: AAVEpool_address, abi: AAVEpoolABI},
    {name: 'tokenA', address: daiAddress, abi: erc20ABI},
    {name: 'tokenB', address: usdcAddress, abi: erc20ABI},
  ]

  // agent types and number of each type that will be used within the simulation
  let agents: MyAgent[] = [
    {'type': AgentLender, nb: 1},
    {'type': AgentBorrower, nb: 1}
  ]

  // simulation parameters
  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents,
    trackedResults: [0,0],
    contracts: contracts
  }

  // Start the simulation using params
  new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
