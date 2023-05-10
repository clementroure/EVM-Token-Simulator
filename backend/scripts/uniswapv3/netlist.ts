import { ethers } from "hardhat"
import uniswapV3NonFungiblePositionManagerABI from '../../abi/uniswapV3NonFungiblePositionManager.json'
import uniswapV3FactoryABI from '../../abi/uniswapV3Factory.json'
import uniswapV3SwapRouterABI from '../../abi/uniswapV3SwapRouter.json'
import uniswapV3PoolABI from '../../abi/uniswapV3Pool.json'
import erc20ABI from '../../abi/ERC20.json'
import { UNI_address, WETH_address, uniswapV3NonFungiblePositionManager_address, uniswapV3Factory_address, uniswapV3SwapRouter_address} from '../../utils/address'
import Simulator from "../../engine/simulator";
import { MyAgent, MyContractFactory } from "../../engine/types"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
const { JsonRpcProvider } = ethers.providers

export default async function main() {

  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)
  // const provider = new JsonRpcProvider('http://127.0.0.1:8545/') // server backend - npx hardhat node (other terminal)
  const UniswapV3Factory= new ethers.Contract(uniswapV3Factory_address, uniswapV3FactoryABI, provider);
  // verify if pool exist
  const pairPoolAddress = await UniswapV3Factory.callStatic.getPool(UNI_address, WETH_address, 3000)

  // Add the address and the abi of the contracts you want to interact with
  const contracts: MyContractFactory[] = [
    {name: 'uniswapV3SwapRouter', address: uniswapV3SwapRouter_address, abi: uniswapV3SwapRouterABI},
    {name: 'uniswapV3Factory', address: uniswapV3Factory_address, abi: uniswapV3FactoryABI},
    {name: 'uniswapV3Pool', address: pairPoolAddress, abi: uniswapV3PoolABI},
    {name: 'uniswapV3NonFungiblePositionManager', address: uniswapV3NonFungiblePositionManager_address, abi: uniswapV3NonFungiblePositionManagerABI},
    {name: 'tokenA', address: UNI_address, abi: erc20ABI},
    {name: 'tokenB', address: WETH_address, abi: erc20ABI},
  ]

  // agent types and number of each type that will be used within the simulation
  let agents: MyAgent[] = [
    // {'type': AgentSwap, nb: 5},
    {'type': AgentLiquidity, nb: 1}
  ]

  // simulation parameters
  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: agents,
    trackedResults: [0,0],
    contracts: contracts
  }

  // Start the simulation using params
  new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
