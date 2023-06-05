import { ethers } from "hardhat"
import Simulator from "../../engine/simulator"
import { MyAgent, MyContractFactory, Token } from "../../utils/types"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
import * as abi from '../../constants/abi'
import * as address from '../../constants/address'
const { JsonRpcProvider } = ethers.providers

export default async function main() {

  // These variables will be removed later //
  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)
  // const provider = new JsonRpcProvider('http://127.0.0.1:8545/') // server backend - npx hardhat node (other terminal)
  const UniswapV2Factory = new ethers.Contract(address.UNISWAP_V2_FACTORY, abi.UNISWAP_V2_FACTORY, provider)
  const tokenA = new ethers.Contract(address.UNI_GOERLI, abi.ERC20, provider)
  const tokenB = new ethers.Contract(address.WETH_GOERLI, abi.ERC20, provider)
  const LpToken_address = await UniswapV2Factory.getPair(address.UNI_GOERLI, address.WETH_GOERLI)
  const LpToken = new ethers.Contract(LpToken_address, abi.ERC20, provider)
  var liquidityPool = [await tokenA.callStatic.balanceOf(LpToken.address),  await tokenB.callStatic.balanceOf(LpToken.address)]
  // end of useless variables //

  // Add the address and the abi of the contracts you want to interact with
  const contracts: MyContractFactory[] = [
    {name: 'uniswapV2Router', address: address.UNISWAP_V2_ROUTER, abi: abi.UNISWAP_V2_ROUTER},
    {name: 'uniswapV2Factory', address: address.UNISWAP_V2_FACTORY, abi: abi.UNISWAP_V2_FACTORY},
    {name: 'tokenA', address: address.UNI_GOERLI, abi: abi.ERC20},
    {name: 'tokenB', address: address.WETH_GOERLI, abi: abi.ERC20},
    {name: 'lpToken', address: LpToken_address, abi:abi.ERC20},
  ]
  // define quantity of tokens needed my each agent
  // WARNING: names have to be the same as your contarcts
  let tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 0.01},
    {name: 'tokenB', decimals: 18, amount: 0.0001}
  ]
  // agent types and number of each type that will be used within the simulation
  let agents: MyAgent[] = [
    {'type': AgentSwap, nb: 5},
    {'type': AgentLiquidity, nb: 1}
  ]
  // simulation parameters
  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: agents,
    trackedResults: liquidityPool,
    contracts: contracts,
    tokens: tokens
  }
  // Start the simulation using params
  new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
