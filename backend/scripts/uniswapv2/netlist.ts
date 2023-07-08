import { ethers } from "hardhat"
import Simulator from "../../engine/simulator"
import { AgentType, MyAgent, MyContractFactory, PoolDeployer, Token, TransformedAgent } from "../../utils/types"
import * as abi from '../../constants/abi'
import * as address from '../../constants/address'
import { Contract } from "ethers/lib/ethers"
import deployPool from '../../utils/deployPool'
import { isolate, getABI } from '../../utils/other'
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
const { JsonRpcProvider } = ethers.providers
const { testUtils } = require('hardhat')
const { block } = testUtils

export default async function uniswap_v2({ parentPort, contracts: _contracts, tokens, agents, netlist, marketPrice }: {
  parentPort: MessagePort | null; 
  contracts: MyContractFactory[]; 
  tokens: Token[];
  agents: any;
  netlist: any;
  marketPrice: number[]
}) {

  /* if(netlist.autoMining == false){
    await block.setAutomine(false)
  } */

  const provider = new JsonRpcProvider(process.env.ALCHEMY_URL as string)

  const contracts = await initContracts(_contracts)

  async function initContracts (contracts: MyContractFactory[]): Promise<Record<string, Contract>> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);
    const contractInstances: Record<string, Contract> = {};
    let i = 0;
  
    for (const contract of contracts) {
      const abi = await getABI(contract.address, 'goerli')
      _contracts[i].abi = abi; 
      contractInstances[contract.name] = new ethers.Contract(contract.address, abi, provider);
      i++;
    }
  
    return contractInstances;
  }

  const pairAddress = await contracts['uniswapV2Factory'].getPair(address.WETH_GOERLI_FAKE, address.USDT_GOERLI_FAKE);
  
  // console.log(pairAddress)

  // WETH/USDT goerli -> 0x9cF9dA905a4A65312150Dea6B87242C54A37CE00
  const pairContract = new ethers.Contract(pairAddress, abi.UNISWAP_V2_PAIR, provider)
  const reserves = await pairContract.getReserves()
  
/*   const tokenA_amount = reserves[1] / 10**18
  const tokenB_amount = reserves[0] / 10**6
  const price = Math.max(tokenA_amount, tokenB_amount) / Math.min(tokenA_amount, tokenB_amount) */

  // // define quantity of tokens needed my each agent
  // // WARNING: names have to be the same as your contarcts
/*   let _tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 100},
    {name: 'tokenB', decimals: 6, amount: 180000}
  ] */

  let _agents: TransformedAgent[];
  if (Array.isArray(agents)) {
      _agents = agents.map((agent: any) => {
          let type: AgentType;
          
          switch(agent.name) {
              case 'swap_agent':
                  type = AgentSwap; // assuming AgentSwap is defined
                  break;
              case 'liquidity_agent':
                  type = AgentLiquidity; // assuming AgentLiquidity is defined
                  break;
              default:
                  throw new Error(`Unknown agent type: ${agent.name}`);
          }
          
          return {
              type: type,
              nb: agent.number
          };
      });
  } else {  // crash if aborted without this
      return; 
  }
  
  // console.log(_agents)

/*   let _agents2: MyAgent[] = [
    {'type': AgentSwap, nb: 8},
    {'type': AgentLiquidity, nb: 1}
  ] */
  
  // simulation parameters
  const params = {
    simulationDuration: netlist.simulationStep,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: _agents,
    trackedResults: [reserves[0], reserves[1]],
    contracts: _contracts,
    tokens: tokens,
    marketPrice: marketPrice,
    parentPort: parentPort,
  }

  // in netlist.ts
  parentPort!.onmessage = (event) => {
    if (event.data.command === 'stop') {
      _simulator.stop();
    }
    else if (event.data.command === 'isolate') {
      isolate(event)
    }
  };

/*   console.log('----------------------')
  console.log(_contracts)
  const _contracts2: MyContractFactory[] = [
    {name: 'uniswapV2Router', address: address.UNISWAP_V2_ROUTER, abi: abi.UNISWAP_V2_ROUTER},
    {name: 'uniswapV2Factory', address: address.UNISWAP_V2_FACTORY, abi: abi.UNISWAP_V2_FACTORY},
    {name: 'tokenA', address: address.WETH_GOERLI_FAKE, abi: abi.ERC20},
    {name: 'tokenB', address: address.USDT_GOERLI_FAKE, abi: abi.ERC20},
    {name: 'pair', address: pairAddress, abi: abi.UNISWAP_V2_PAIR},
  ]
  console.log('==========================')
  console.log(_contracts2)
  console.log('----------------------') */


  const _simulator = new Simulator(params);
  await _simulator.init(true, true, true, _contracts, _agents);
  await _simulator.start();
}

// const poolDeployer: PoolDeployer =  {
//   tokenA_name: 'Wrapped Ether',
//   tokenA_symbol: 'WETH',
//   tokenA_decimals : 18,
//   tokenA_supply: 100,
//   tokenB_name: 'Tether USD',
//   tokenB_symbol : 'USDT',
//   tokenB_decimals: 6,
//   tokenB_supply: 180000
// }

// const pool = await deployPool(poolDeployer)
// console.log(pool)