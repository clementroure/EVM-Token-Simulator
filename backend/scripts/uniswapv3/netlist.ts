import { ethers } from "hardhat"
import Simulator from "../../engine/simulator";
import { MyAgent, MyContractFactory, Token } from "../../utils/types"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
import * as abi from '../../constants/abi'
import * as address from '../../constants/address'
const { JsonRpcProvider } = ethers.providers

export default async function main() {

  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)
  // const provider = new JsonRpcProvider('http://127.0.0.1:8545/') // server backend - npx hardhat node (other terminal)
  const UniswapV3Factory= new ethers.Contract(address.UNISWAP_V3_FACTORY, abi.UNISWAP_V3_FACTORY, provider);
  // verify if pool exist
  const pairPoolAddress = await UniswapV3Factory.callStatic.getPool(address.UNI_GOERLI, address.WETH_GOERLI, 3000)

  // Add the address and the abi of the contracts you want to interact with
  const contracts: MyContractFactory[] = [
    {name: 'uniswapV3SwapRouter', address: address.UNISWAP_V3_SWAP_ROUTER, abi: abi.UNISWAP_V3_SWAP_ROUTER},
    {name: 'uniswapV3Factory', address: address.UNISWAP_V3_FACTORY, abi: abi.UNISWAP_V3_FACTORY},
    {name: 'uniswapV3Pool', address: pairPoolAddress, abi: abi.UNISWAP_V3_POOL},
    {name: 'uniswapV3NonFungiblePositionManager', address: address.UNISWAP_V3_NON_FUNGIBLE_TOKEN_POSITION, abi: abi.UNISWAP_V3_NON_FUNGIBLE_TOKEN_POSITION},
    {name: 'tokenA', address: address.UNI_GOERLI, abi: abi.ERC20},
    {name: 'tokenB', address: address.WETH_GOERLI, abi: abi.ERC20},
  ]
  // define quantity of tokens needed my each agent
  // WARNING: names have to be the same as your contarcts
  let tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 0.01},
    {name: 'tokenB', decimals: 18, amount: 0.0001}
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
    contracts: contracts,
    tokens: tokens
  }
  // Start the simulation using params
  const _simulator = new Simulator(params)
  await _simulator.start()
}