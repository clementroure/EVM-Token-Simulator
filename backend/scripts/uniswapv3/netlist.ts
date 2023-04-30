import { ethers } from "hardhat";
import { testUtils } from 'hardhat';
const { block } = testUtils
import { writeFile, appendFile } from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import {normal_distribution, poisson_distribution, binomial_distribution} from '../../utils/distributions'
import uniswapV2RouterABI from '../../abi/UniswapV2Router.json'
import uniswapV2FactoryABI from '../../abi/UniswapV2Factory.json'
import uniABI from '../../abi/UNI.json'
import wethABI from '../../abi/WETH.json'
import LpTokenABI from '../../abi/LpToken.json'
import uniswapV3NonFungiblePositionManagerABI from '../../abi/uniswapV3NonFungiblePositionManager.json'
import uniswapV3FactoryABI from '../../abi/uniswapV3Factory.json'
import uniswapV3SwapRouterABI from '../../abi/uniswapV3SwapRouter.json'
import uniswapV3PoolABI from '../../abi/uniswapV3Pool.json'
import {uniswapV2Router_address, uniswapV2Factory_address, UNI_address, WETH_address, uniswapV3NonFungiblePositionManager_address, uniswapV3Factory_address, uniswapV3SwapRouter_address} from '../../utils/address'
// @ts-ignore
import Stopwatch from 'statman-stopwatch';
import * as dotenv from "dotenv";
import AgentLiquidity from "./agents/agentLiquidity";
import AgentSwap from "./agents/agentSwap";

dotenv.config();

// set the .csv path and headers
const csvWriter = createCsvWriter({
  path: 'outdir_data/data.csv',
  header: [
    {id: 'tick', title: 'tick'},
    {id: 'amountA', title: 'amountA'},
    {id: 'amountB', title: 'amountB'}
  ]
});

export default async function main() {

  const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL as string)

  // block.setAutomine(false)

  // I unlock my MetaMask wallet. On Goerli, I have a few eth, weth and uni tokens
  // The agents will be initialized with 1000 ETH but I have to fund them with other ERC-20 tokens
  const godWallet = await ethers.getImpersonatedSigner("0xb94F07f701304ba29A40796499c9a01E9EaD24E5");

  var currentBlock = (await ethers.provider.getBlock("latest")).number
  const simulationDuration = 10

  var step = 0;

  // 1 step = 1 day in the simulation
  function getStep (): number {
    return step;
  }
  function getCurrentBlock (): number {
    return currentBlock;
  }
  async function setLiquidityPool(agentName: string, amountA: number, amountB: number){
    liquidityPool = [amountA, amountB]
    const txt =  (step+1) + ': ' + agentName + ' -> amountA: ' +  amountA/10**18 + ' amountB: ' + amountB/10**18 + '\n'
    appendFile('outdir_data/logs.txt', txt, (err) => {
        if (err) throw err;
    })
  } 

  const accounts = await ethers.getSigners();

  var normalDistributionAgent = []
  var poissonDistributionAgent = []
  var binomialDistributionAgent = []
  
  for (let i = 0; i < simulationDuration+1; i++) {
    normalDistributionAgent.push(normal_distribution(0,2,1))
  }
  poissonDistributionAgent = poisson_distribution(2, simulationDuration+1)
  binomialDistributionAgent = binomial_distribution(1,0.5, simulationDuration+1)

  // console.log(normalDistributionAgent)
  // console.log(poissonDistributionAgent)      
  // console.log(binomialDistributionAgent)

  const UniswapV3NonFungiblePositionManager = new ethers.Contract(uniswapV3NonFungiblePositionManager_address, uniswapV3NonFungiblePositionManagerABI, provider);
  const UniswapV3Factory= new ethers.Contract(uniswapV3Factory_address, uniswapV3FactoryABI, provider);
  const UniswapV3SwapRouter= new ethers.Contract(uniswapV3SwapRouter_address, uniswapV3SwapRouterABI, provider);

  const UNI = new ethers.Contract(UNI_address, uniABI, provider);
  const WETH = new ethers.Contract(WETH_address, wethABI, provider);

  // verify if pool exist
  const pairPoolAddress = await UniswapV3Factory.callStatic.getPool(UNI.address, WETH.address, 3000)
  const UniswapV3Pool = new ethers.Contract(pairPoolAddress, uniswapV3PoolABI, provider);

  // amount of token A and B in the liquidity pool weth / uni
  var liquidityPool = [0,  0]
  
  // set the logs.txt path 
  // all the activity during the simulation will be recorded here (ex: t=0 - Agent_1 Swap 156156 UNI token for 11564 WETH, Agent_2 Added Liquidity 156156 UNI and 11564 WETH)
  let txt = 'Normal Distribution: ' + normalDistributionAgent.toString() + '\n' + 'Poisson Distribution: ' + poissonDistributionAgent.toString() + '\n' + 'Binomial Distribution: ' + binomialDistributionAgent.toString() + '\n'
  writeFile('outdir_data/logs.txt', txt, (err) => {
    if (err) throw err;
  })
  txt =  'Initialisation' + ' -> amountA: ' +  liquidityPool[0]/10**18 + ' amountB: ' + liquidityPool[1]/10**18 + '\n'
  appendFile('outdir_data/logs.txt', txt, (err) => {
    if (err) throw err;
  })
  await csvWriter.writeRecords([{tick: step, amountA: liquidityPool[0]/10**18, amountB: liquidityPool[1]/10**18}]).catch((e) => {
    console.log(e);
  })

  const agentLiquidity = new AgentLiquidity(
    'liquidity_0', accounts[10], godWallet, UniswapV3Pool, UniswapV3NonFungiblePositionManager, UniswapV3Factory,  UNI, WETH,
    normalDistributionAgent, poissonDistributionAgent, binomialDistributionAgent, 
    getStep, getCurrentBlock, setLiquidityPool,
  )
  const agentSwap = new AgentSwap(
    'swap_0', accounts[0], godWallet, UniswapV3Pool, UniswapV3SwapRouter, UniswapV3Factory,  UNI, WETH,
    normalDistributionAgent, poissonDistributionAgent, binomialDistributionAgent, 
    getStep, getCurrentBlock, setLiquidityPool,
  )

  await WETH.connect(godWallet).transfer(accounts[10].address, ethers.utils.parseUnits('0.0001', 18))
  await UNI.connect(godWallet).transfer(accounts[10].address, ethers.utils.parseUnits('0.01', 18))
  //
  await WETH.connect(godWallet).transfer(accounts[0].address, ethers.utils.parseUnits('0.0001', 18))
  await UNI.connect(godWallet).transfer(accounts[0].address, ethers.utils.parseUnits('0.01', 18))

  // debug timer
  const stopwatch = new Stopwatch();
  stopwatch.start();

  while(step < simulationDuration){

    console.log(step)

    // CALL AGENTS MAIN METHOD
    await agentLiquidity.takeStep()
    // await agentSwap.takeStep()

    // await block.advance(1) // mine a block on the hardhat local fork. Transactions in the mempool are added

    step+=1; 

    currentBlock = (await ethers.provider.getBlock("latest")).number

    await csvWriter.writeRecords([{tick: step, amountA: liquidityPool[0]/10**18, amountB: liquidityPool[1]/10**18}]).catch((e) => {
      console.log(e);
    })
  }

  // debug
  stopwatch.stop();
  let time = stopwatch.read();
  console.log("Simulation duration : " + (time/1000).toFixed(3) + 's')
}

main()
    .then(() => console.log("Simulation complete"))
    .catch((error) => console.error("Error simulating scenario: ", error));
