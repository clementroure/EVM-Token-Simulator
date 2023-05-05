import { ethers } from "hardhat"
import uniswapV2RouterABI from '../../abi/UniswapV2Router.json'
import uniswapV2FactoryABI from '../../abi/UniswapV2Factory.json'
import erc20ABI from '../../abi/ERC20.json'
import LpTokenABI from '../../abi/LpToken.json'
import {uniswapV2Router_address, uniswapV2Factory_address, UNI_address, WETH_address} from '../../utils/address'
import Simulator from "../../engine/simulator";
import { MyAgent, MyContractFactory } from "../../engine/types"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
const { JsonRpcProvider } = ethers.providers

export default async function main() {

  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)

  const UniswapV2Factory = new ethers.Contract(uniswapV2Factory_address, uniswapV2FactoryABI, provider)
  const tokenA = new ethers.Contract(WETH_address, erc20ABI, provider)
  const tokenB = new ethers.Contract(UNI_address, erc20ABI, provider)

  const LpToken_address = await UniswapV2Factory.getPair(UNI_address, WETH_address)
  const LpToken = new ethers.Contract(LpToken_address, LpTokenABI, provider)

  var liquidityPool = [await tokenA.callStatic.balanceOf(LpToken.address),  await tokenB.callStatic.balanceOf(LpToken.address)]

  const contracts: MyContractFactory[] = [
    {name: 'uniswapV2Router', address: uniswapV2Router_address, abi: uniswapV2RouterABI},
    {name: 'uniswapV2Factory', address: uniswapV2Factory_address, abi: uniswapV2FactoryABI},
    {name: 'tokenA', address: WETH_address, abi: erc20ABI},
    {name: 'tokenB', address: UNI_address, abi: erc20ABI},
    {name: 'lpToken', address: LpToken_address, abi: LpTokenABI},
  ]

  let agents: MyAgent[] = [
    {'type': AgentSwap, nb: 5},
    {'type': AgentLiquidity, nb: 1}
  ]

  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents,
    trackedResults: liquidityPool,
    contracts: contracts
  }

  const simulator = new Simulator(params)
}

main()
    .catch((error) => console.error("Error simulating scenario: ", error))
