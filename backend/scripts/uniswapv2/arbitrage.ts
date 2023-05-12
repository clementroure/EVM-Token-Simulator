import { ethers } from "hardhat"
import uniswapV2RouterABI from '../../abi/UniswapV2Router.json'
import uniswapV2FactoryABI from '../../abi/UniswapV2Factory.json'
import erc20ABI from '../../abi/ERC20.json'
import LpTokenABI from '../../abi/LpToken.json'
import uniswapV2PairABI from '../../abi/UniswapV2Pair.json'
import {uniswapV2Router_address, uniswapV2Factory_address, WETH_address_fake, USDT_address_fake} from '../../utils/address'
import Simulator from "../../engine/simulator"
import { MyAgent, MyContractFactory, Token } from "../../utils/types"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
const { JsonRpcProvider } = ethers.providers

export default async function main() {

  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)

  const UniswapV2Factory = new ethers.Contract(uniswapV2Factory_address, uniswapV2FactoryABI, provider)

  const pairAddress = await UniswapV2Factory.getPair(WETH_address_fake, USDT_address_fake)
  console.log(pairAddress)
  // WETH/USDT goerli -> 0x9cF9dA905a4A65312150Dea6B87242C54A37CE00
  const pairContract = new ethers.Contract(pairAddress, uniswapV2PairABI, provider)
  const reserves = await pairContract.getReserves()
  
  const tokenA_amount = reserves[1] / 10**18
  const tokenB_amount = reserves[0] / 10**6
  const price = Math.max(tokenA_amount, tokenB_amount) / Math.min(tokenA_amount, tokenB_amount)
  console.log(tokenA_amount, tokenB_amount)
  console.log('1 WETH = $' + price)

  // Add the address and the abi of the contracts you want to interact with
  const contracts: MyContractFactory[] = [
    {name: 'uniswapV2Router', address: uniswapV2Router_address, abi: uniswapV2RouterABI},
    {name: 'uniswapV2Factory', address: uniswapV2Factory_address, abi: uniswapV2FactoryABI},
    {name: 'tokenA', address: WETH_address_fake, abi: erc20ABI},
    {name: 'tokenB', address: USDT_address_fake, abi: erc20ABI},
    {name: 'pair', address: pairAddress, abi: LpTokenABI},
  ]
  // define quantity of tokens needed my each agent
  // WARNING: names have to be the same as your contarcts
  let tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 1},
    {name: 'tokenB', decimals: 6, amount: 1800}
  ]
  // agent types and number of each type that will be used within the simulation
  let agents: MyAgent[] = [
    {'type': AgentSwap, nb: 1},
    // {'type': AgentLiquidity, nb: 1}
  ]
  // simulation parameters
  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: agents,
    trackedResults: [reserves[0], reserves[1]],
    contracts: contracts,
    tokens: tokens
  }
  // Start the simulation using params
  new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
