import { ethers } from "hardhat"
import Simulator from "../../engine/simulator"
import { MyAgent, MyContractFactory, Token } from "../../utils/types"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
import * as abi from '../../constants/abi'
import * as address from '../../constants/address'
const { JsonRpcProvider } = ethers.providers
const { testUtils } = require('hardhat')
const { block } = testUtils

export default async function main({ parentPort }: {parentPort: MessagePort | null}) {

  // await block.setAutomine(false)

  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)

  const UniswapV2Factory = new ethers.Contract(address.UNISWAP_V2_FACTORY, abi.UNISWAP_V2_FACTORY, provider)

  const pairAddress = await UniswapV2Factory.getPair(address.WETH_GOERLI_FAKE, address.USDT_GOERLI_FAKE)
  // console.log(pairAddress)

  // WETH/USDT goerli -> 0x9cF9dA905a4A65312150Dea6B87242C54A37CE00
  const pairContract = new ethers.Contract(pairAddress, abi.UNISWAP_V2_PAIR, provider)
  const reserves = await pairContract.getReserves()
  
  const tokenA_amount = reserves[1] / 10**18
  const tokenB_amount = reserves[0] / 10**6
  const price = Math.max(tokenA_amount, tokenB_amount) / Math.min(tokenA_amount, tokenB_amount)
  // console.log(tokenA_amount, tokenB_amount)
  // console.log('1 WETH = $' + price)

  // Add the address and the abi of the contracts you want to interact with
  const contracts: MyContractFactory[] = [
    {name: 'uniswapV2Router', address: address.UNISWAP_V2_ROUTER, abi: abi.UNISWAP_V2_ROUTER},
    {name: 'uniswapV2Factory', address: address.UNISWAP_V2_FACTORY, abi: abi.UNISWAP_V2_FACTORY},
    {name: 'tokenA', address: address.WETH_GOERLI_FAKE, abi: abi.ERC20},
    {name: 'tokenB', address: address.USDT_GOERLI_FAKE, abi: abi.ERC20},
    {name: 'pair', address: pairAddress, abi: abi.UNISWAP_V2_PAIR},
  ]
  // define quantity of tokens needed my each agent
  // WARNING: names have to be the same as your contarcts
  let tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 100},
    {name: 'tokenB', decimals: 6, amount: 180000}
  ]
  // agent types and number of each type that will be used within the simulation
  let agents: MyAgent[] = [
    {'type': AgentSwap, nb: 19},
    {'type': AgentLiquidity, nb: 1}
  ]
  // simulation parameters
  const params = {
    simulationDuration: 2,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: agents,
    trackedResults: [reserves[0], reserves[1]],
    contracts: contracts,
    tokens: tokens
  }
  // Start the simulation using params
  const _simulator = new Simulator(params)
  await _simulator.start()

  parentPort?.postMessage({ status: 'success'})
}

// main()
//     .catch((error) => console.error("Error simulating scenario: ", error))
