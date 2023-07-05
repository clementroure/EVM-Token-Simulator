import { ethers } from "hardhat"
import Simulator from "../../engine/simulator"
import { MyAgent, MyContractFactory, PoolDeployer, Token } from "../../utils/types"
import * as abi from '../../constants/abi'
import * as address from '../../constants/address'
import { Contract } from "ethers/lib/ethers"
import AgentSwap from "./agents/agentSwap"
import AgentLiquidity from "./agents/agentLiquidity"
import runHostileCode from '../../utils/isolated'
import deployPool from '../../utils/deployPool'
const { JsonRpcProvider } = ethers.providers
const { testUtils } = require('hardhat')
const { block } = testUtils

export default async function uniswap_v2({ parentPort, contracts, tokens, agents }: {
  parentPort: MessagePort | null; 
  contracts: MyContractFactory[]; 
  tokens: Token[];
  agents: any;
}) {

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
  const _contracts: MyContractFactory[] = [
    {name: 'uniswapV2Router', address: address.UNISWAP_V2_ROUTER, abi: abi.UNISWAP_V2_ROUTER},
    {name: 'uniswapV2Factory', address: address.UNISWAP_V2_FACTORY, abi: abi.UNISWAP_V2_FACTORY},
    {name: 'tokenA', address: address.WETH_GOERLI_FAKE, abi: abi.ERC20},
    {name: 'tokenB', address: address.USDT_GOERLI_FAKE, abi: abi.ERC20},
    {name: 'pair', address: pairAddress, abi: abi.UNISWAP_V2_PAIR},
  ]

  // const contracts = _contracts.map((contract) => {
  //   return {
  //     ...contract,
  //     abi: getABI(contract.address, 'goerli')
  //   };
  // });

  // // define quantity of tokens needed my each agent
  // // WARNING: names have to be the same as your contarcts
  let _tokens: Token[] = [
    {name: 'tokenA', decimals: 18, amount: 100},
    {name: 'tokenB', decimals: 6, amount: 180000}
  ]
  // const tokens = _tokens.map((token) => {
  //   return {
  //     ...token,
  //     abi: abi.ERC20
  //   };
  // });

  // console.log(agents)
  interface OriginalAgent {
    agent: 'swap_agent' | 'liquidity_agent';
    number: number;
  }
  
  type AgentType = typeof AgentSwap | typeof AgentLiquidity;
  
  interface TransformedAgent {
    type: AgentType;
    nb: number;
  }

  if (Array.isArray(agents)) {
    const _agents: TransformedAgent[] = agents.map((item: any) => {
      let type: AgentType;
      
      switch(item.name) {
        case 'swap_agent':
          type = AgentSwap; // assuming AgentSwap is defined
          break;
        case 'liquidity_agent':
          type = AgentLiquidity; // assuming AgentLiquidity is defined
          break;
        default:
          throw new Error(`Unknown agent type: ${item.name}`);
      }
      
      return {
        type: type,
        nb: item.number
      };
    });
  } else {  // crash if aborted without this
    return; 
  }

  // console.log(_agents)

  let _agents2: MyAgent[] = [
    {'type': AgentSwap, nb: 8},
    {'type': AgentLiquidity, nb: 1}
  ]

  
  // simulation parameters
  const params = {
    simulationDuration: 10,
    normalDistribution: true,
    poissonDistribution: true,
    binomialDistribution: true,
    agents: _agents2,
    trackedResults: [reserves[0], reserves[1]],
    contracts: _contracts,
    tokens: _tokens,
    parentPort: parentPort
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

  const _simulator = new Simulator(params);
  await _simulator.init(true, true, true, _contracts, _agents2);
  await _simulator.start();

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
}

const isolate = async (event:any) => {
  const success = await runHostileCode(event.data.code, 128)
  console.log('isloated code run: ' + success)
}

async function getABI(address: string, network: string = 'goerli') {
  const etherscan_apiKey = process.env.ETHERSCAN_API_KEY as string;
  // const polygonscan_apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY as string;
  let url = '';
  
  switch (network) {
    case 'mainnet':
      url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscan_apiKey}`;
      break;
    case 'goerli':
      url = `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscan_apiKey}`;
      break;
    // case 'polygon':
    //   url = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${polygonscan_apiKey}`;
      break;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }

  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === '1') {
    return JSON.parse(data.result);
  } else {
    throw new Error('Failed to fetch ABI');
  }
}