import { ethers } from "hardhat";
import { testUtils } from 'hardhat';
const { block } = testUtils
import { writeFile, appendFile } from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import {normal_distribution, poisson_distribution, binomial_distribution} from '../../utils/distributions'
import AgentSwap from './agentSwap'
import uniswapV2RouterABI from '../../abi/UniswapV2Router.json'
import uniswapV2FactoryABI from '../../abi/UniswapV2Factory.json'
import uniABI from '../../abi/UNI.json'
import wethABI from '../../abi/WETH.json'
import LpTokenABI from '../../abi/LpToken.json'
import {uniswapV2Router_address, uniswapV2Factory_address, UNI_address, WETH_address} from '../../utils/address'
import {sleep} from '../../utils/other'
import AgentLiquidity from "./agentLiquidity";

// set the .csv path and headers
const csvWriter = createCsvWriter({
  path: 'outdir_csv/data.csv',
  header: [
    {id: 'tick', title: 'tick'},
    {id: 'amountA', title: 'amountA'},
    {id: 'amountB', title: 'amountB'}
  ]
});

async function main() {

  // set the logs.txt path 
  // all the activity during the simulation will be recorded here (ex: t=0 - Agent_1 Swap 156156 UNI token for 11564 WETH, Agent_2 Added Liquidity 156156 UNI and 11564 WETH)
  writeFile('outdir_csv/logs.txt', '', (err) => {
    if (err) throw err;
  })

  // block.setAutomine(false)

  // I unlock my MetaMask wallet. On Goerli, I have a few eth, weth and uni tokens
  // The agents will be initialized with 1000 ETH but I have to fund them with other ERC-20 tokens
  const godWallet = await ethers.getImpersonatedSigner("0x7bBfecDCF7d0E7e5aA5fffA4593c26571824CB87");

  var currentBlock = (await ethers.provider.getBlock("latest")).number
  const simulationDuration = 10
  const endBlock = currentBlock + simulationDuration

  var step = 0;

  // 1 step = 1 day in the simulation
  function getStep (): number {
    return step;
  }
  function getCurrentBlock (): number {
    return currentBlock;
  }
  async function setLiquidityPool(amountA: number, amountB: number){
    liquidityPool = [amountA, amountB]
    const txt = step + ': amountA: ' +  amountA/10**18 + ' amountB: ' + amountB/10**18 + '\n'
    appendFile('outdir_csv/logs.txt', txt, (err) => {
        if (err) throw err;
    })
  } 

  const accounts = await ethers.getSigners();

  var normalDistributionAgent = []
  var poissonDistributionAgent = []
  var binomialDistributionAgent = []
  
  for (let i = 0; i < 100; i++) {
    normalDistributionAgent.push(normal_distribution(0,2,1))
  }
  poissonDistributionAgent = poisson_distribution(2,100)
  binomialDistributionAgent = binomial_distribution(1,0.5,100)

  // console.log(normalDistributionAgent)
  // console.log(poissonDistributionAgent)
  // console.log(binomialDistributionAgent)

  const UniswapV2Router = new ethers.Contract(uniswapV2Router_address, uniswapV2RouterABI, accounts[10]);
  const UniswapV2Factory = new ethers.Contract(uniswapV2Factory_address, uniswapV2FactoryABI, accounts[10]);

  const UNI = new ethers.Contract(UNI_address, uniABI, accounts[10]);
  const WETH = new ethers.Contract(WETH_address, wethABI, accounts[10]);

  const LpToken_address = await UniswapV2Factory.getPair(UNI_address, WETH_address)
  const LpToken = new ethers.Contract(LpToken_address, LpTokenABI, accounts[10])

  // send tokens to agent ( I prefer fund them in their constructor() method )
  const WETH_godWallet = new ethers.Contract(WETH_address, wethABI, godWallet)
  const UNI_godWallet = new ethers.Contract(UNI_address, uniABI, godWallet)

  // amount of token A and B in the liquidity pool weth / uni
  var liquidityPool = [await UNI.callStatic.balanceOf(LpToken.address),  await WETH.callStatic.balanceOf(LpToken.address)]

  const swapAgentNb = 5
  let agentSwap: AgentSwap[] = []

  for(let i =0; i<swapAgentNb; i++){
    agentSwap.push(
      new AgentSwap(
        'swap_'+i.toString(), accounts[i], godWallet, UniswapV2Router, UniswapV2Factory, UNI, WETH, LpToken, 
        normalDistributionAgent, poissonDistributionAgent, binomialDistributionAgent, 
        getStep, getCurrentBlock, setLiquidityPool
      )
    )
    await WETH_godWallet.transfer(accounts[i].address, ethers.utils.parseUnits('0.001', 18))
    await UNI_godWallet.transfer(accounts[i].address, ethers.utils.parseUnits('0.004', 18))
  }

  const agentLiquidity = new AgentLiquidity(
    'liquidity_0', accounts[10], godWallet, UniswapV2Router, UniswapV2Factory, UNI, WETH, LpToken, 
    normalDistributionAgent, poissonDistributionAgent, binomialDistributionAgent, 
    getStep, getCurrentBlock, setLiquidityPool,
  )

  await WETH_godWallet.transfer(accounts[10].address, ethers.utils.parseUnits('0.001', 18))
  await UNI_godWallet.transfer(accounts[10].address, ethers.utils.parseUnits('0.004', 18))


  while(step < 30){

    console.log(step)

    await csvWriter.writeRecords([{tick: step, amountA: liquidityPool[0]/10**18, amountB: liquidityPool[1]/10**18}]).catch((e) => {
      console.log(e);
    })

    // CALL AGENTS MAIN METHOD
    for(let i =0; i<swapAgentNb; i++){
       await agentSwap[i].takeStep()
    }
    await agentLiquidity.takeStep()

    // await block.advance(1) // mine a block on the hardhat local fork. Transactions in the mempool are added

    step+=1; 

    currentBlock = (await ethers.provider.getBlock("latest")).number
  }
}

main()
    .then(() => console.log("Simulation complete"))
    .catch((error) => console.error("Error simulating scenario: ", error));
