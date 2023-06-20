import { ethers } from "hardhat";
import { Contract, ethers as eth } from "ethers";
const { JsonRpcProvider } = ethers.providers;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import * as dotenv from "dotenv";
import { binomial_distribution, calculateBlackScholesPrice, normal_distribution, poisson_distribution } from "../utils/distributions";
// @ts-ignore
import Stopwatch from 'statman-stopwatch';
import Printer from "./printer";
import AgentBase from "./agentBase";
import { MyAgent, MyContractFactory, Token } from "../utils/types";
import JumpDiffusion from "../utils/jumpDiffusion";
import { log } from "firebase-functions/logger";
const { testUtils } = require('hardhat')
const { block } = testUtils
dotenv.config();

export default class Simulator{
   isRunning: boolean = false;

   step: number = 0
   provider: eth.providers.JsonRpcProvider =  new JsonRpcProvider(process.env.ALCHEMY_URL as string)
   godWallet:  SignerWithAddress | undefined = undefined
   agentWallets : SignerWithAddress[] = []
   agents: AgentBase[] = []
   trackedResults: number[] = []
   printer: Printer | undefined = undefined
   stopwatch = new Stopwatch()
   //
   simulationDuration: number
   distributions?: { [key: string]: number[] } = {}
   contracts?: { [key: string]: Contract } = {}
   tokens?: Token[]
   parentPort: MessagePort | null

   constructor(params: {
    simulationDuration: number, 
    normalDistribution: boolean, poissonDistribution: boolean, binomialDistribution: boolean,
    agents: MyAgent[],
    trackedResults: number[],
    contracts: MyContractFactory[],
    tokens: Token[],
    parentPort: MessagePort | null
   }){
    this.simulationDuration = params.simulationDuration
    this.trackedResults = params.trackedResults
    this.printer = new Printer(params.trackedResults)
    this.tokens = params.tokens
    this.parentPort = params.parentPort
    
    // this.init(params.normalDistribution, params.poissonDistribution, params.binomialDistribution, params.contracts, params.agents)
   }

   async init(normalDistribution:boolean, poissonDistribution:boolean, binomialDistribution:boolean, contracts:MyContractFactory[], agents: MyAgent[]){
    await this.generateDistributions(normalDistribution, poissonDistribution, binomialDistribution)
    await this.initWallets()
    await this.generateContracts(contracts)
    await this.generateAgents(agents)
    await this.fundAgents()
   }

   async generateDistributions(normalDistribution: boolean, poissonDistribution: boolean, binomialDistribution: boolean){
    if (normalDistribution){
        var normalDistributionArray = []
        for (let i = 0; i < this.simulationDuration+1; i++) {
            normalDistributionArray.push(normal_distribution(0,2,1))
        }
        this.distributions![`normal`] = normalDistributionArray
    }
    if(poissonDistribution){
        const poissonDistributionArray = poisson_distribution(14, this.simulationDuration+1)
        this.distributions![`poisson`] = poissonDistributionArray
    }
    if(binomialDistribution){
        const binomialDistributionArray = binomial_distribution(1,0.5, this.simulationDuration+1)
        this.distributions![`binomial`] = binomialDistributionArray
    }
    let txt = 'Normal Distribution: ' + this.distributions![`normal`].toString() + '\n' + 'Poisson Distribution: ' + this.distributions![`poisson`].toString() + '\n'
    this.printer!.initTxt(txt)
   }

   async initWallets(){
    this.godWallet = await ethers.getImpersonatedSigner(process.env.GOD_WALLET_ADDRESS as string)
    this.agentWallets = await ethers.getSigners()
   }

   async generateContracts(contracts: MyContractFactory[]){
    for(let i=0; i<contracts.length; i++){
        this.contracts![`${contracts![i].name}`] = new Contract(contracts[i].address, contracts[i].abi, this.agentWallets![i])
    }
   }

   async generateAgents(agents: MyAgent[]){
    for (let i = 0; i< agents.length; i++){
        for(let j=0; j<agents[i].nb; j++){
            // define the new agent as the contracts caller ('from')
            for (const key in this.contracts) 
                this.contracts![key] = this.contracts![key].connect(this.agentWallets[j])
            // instantiate agent
            this.agents!.push(
                new agents[i].type(
                    'swap_'+j.toString(),this.parentPort, this.agentWallets[j], this.printer,
                    this.getStep, this.setTrackedResults,
                    this.distributions, this.contracts
                )
            )
        }
    }
   }

   async fundAgents(){
    for(let i=0; i<this.agents!.length; i++){
        
        for(let j=0;j<this.tokens!.length;j++){
             
            await this.contracts![this.tokens![j].name].connect(this.godWallet!).transfer(this.agents![i].wallet.address, ethers.utils.parseUnits(this.tokens![j].amount.toString(), this.tokens![j].decimals))
        }
    }
   }

   async start(){
        // Test the model

        // Test the model and save results to a CSV file
        // const model = new JumpDiffusion(100, 0.05, 0.2, -0.2, 0.3, 1);
        // const path = model.simulate(1, 0.01);
        // model.saveToCSV(path, 'JumpDiffusion.csv');

     console.log('Simulation started')
     this.isRunning = true; 

    //  const txt =  'Initialisation' + ' -> amountA: ' +  this.trackedResults[1]/10**18 + ' amountB: ' + this.trackedResults[0]/10**6 + '\n'
    //  this.printer!.printTxt(txt)
    //  await this.printer!.printCsv(this.step, this.trackedResults)

     this.stopwatch.start()

     while(this.step < this.simulationDuration) {
        if(this.isRunning){
            await this.takeStep()
            this.parentPort?.postMessage({ status: 'step', value: this.step.toString()})
        }
        else
        break
     }

     this.stopwatch.stop()
     console.log('Simulation duration: ' + (this.stopwatch.stop()/1000).toFixed(3) + 's')

     this.parentPort?.postMessage({ status: 'success', value: 'Simulation ended !'})
   }

   stop() {
    console.log("ABORT")
    this.isRunning = false;
   }

   async takeStep(){

     console.log('step: ' + this.step)
     // MARKET PRICE
     const initialPrice = 1800; // Assuming initial price P_t = 1800
     const u = 1; // Average price
     const sigma = 0.2 * u; // Volatility (standard deviation)
     const dt = 0.001; // Time interval

     const marketPrice = calculateBlackScholesPrice(initialPrice, u, sigma, dt).toFixed(2)
     console.log('Market Price = $' + marketPrice)

     const epsilonPrice = parseFloat(marketPrice)/10000 // 0.01 %
     let params = {
        marketPrice: marketPrice,
        epsilonPrice: epsilonPrice,
        checkSlippage: false
     }

    //  await block.setAutomine(false) // uniswap v2 slippage

     //

     for(let i =0; i<this.agents!.length; i++){
        if(this.isRunning)
        await this.agents![i].takeStep(params)
        else
        break
     }

    // await block.advance()
    // await block.setAutomine(true)

    // params = {
    //     marketPrice: marketPrice,
    //     epsilonPrice: epsilonPrice,
    //     checkSlippage: true
    //  }

    //  // only swap agents // uniswap v2 slippage
    //  for(let i =1; i<this.agents!.length; i++){ 
    //     await this.agents![i].takeStep(params)
    //  }

     await this.printer!.printCsv(this.step, this.trackedResults)
     this.step+=1
   }

   // methods gave to the agents
   // we use  = () =>  to bind the step variable. Without this,  .this won't refer to the same var in the parent or child object
   getStep = ():number => {
      return this.step
   }
   setTrackedResults = (name: string,values: number[]):void => {
      this.trackedResults = values
   }

   
}