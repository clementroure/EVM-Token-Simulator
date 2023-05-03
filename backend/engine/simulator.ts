import { ethers } from "hardhat";
import { Contract, ethers as eth } from "ethers";
const { JsonRpcProvider } = ethers.providers;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import * as dotenv from "dotenv";
import { binomial_distribution, normal_distribution, poisson_distribution } from "../utils/distributions";
// @ts-ignore
import Stopwatch from 'statman-stopwatch';
import Printer from "./printer";
import AgentBase from "./agentBase";
import AgentSwap from "../scripts/uniswapv2/agents/agentSwap";
import { MyContractFactory } from "./types";
dotenv.config();

export default class Simulator{

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

   constructor(params: {
    simulationDuration: number, 
    normalDistribution: boolean, poissonDistribution: boolean, binomialDistribution: boolean,
    agentNb: number,
    trackedResults: number[]
    contracts: MyContractFactory[]
   }){
    this.simulationDuration = params.simulationDuration
    this.trackedResults = params.trackedResults
    this.printer = new Printer(params.trackedResults)
    
    this.init(params.normalDistribution, params.poissonDistribution, params.binomialDistribution, params.contracts, params.agentNb)
   }

   async init(normalDistribution:boolean, poissonDistribution:boolean, binomialDistribution:boolean, contracts:MyContractFactory[], agentNb:number){
    await this.generateDistributions(normalDistribution, poissonDistribution, binomialDistribution)
    await this.initWallets()
    await this.generateContracts(contracts)
    await this.generateAgents(agentNb)
    await this.fundAgents()
    await this.start()
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
        const poissonDistributionArray = poisson_distribution(2, this.simulationDuration+1)
        this.distributions![`poisson`] = poissonDistributionArray
    }
    if(binomialDistribution){
        const binomialDistributionArray = binomial_distribution(1,0.5, this.simulationDuration+1)
        this.distributions![`binomial`] = binomialDistributionArray
    }
    let txt = 'Normal Distribution: ' + this.distributions![`normal`].toString() + '\n' + 'Poisson Distribution: ' + this.distributions![`poisson`].toString() + '\n' + 'Binomial Distribution: ' + this.distributions![`binomial`].toString() + '\n'
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

   async generateAgents(agentNb: number){
      for(let i=0; i<agentNb; i++){
        this.agents!.push(
            new AgentSwap(
                'swap_'+i.toString(), this.agentWallets![i], this.printer!,
                this.getStep, this.setTrackedResults,
                this.contracts!['uniswapV2Router'], this.contracts!['uniswapV2Factory'], 
                this.contracts!['tokenA'], this.contracts!['tokenB'], this.contracts!['lpToken'],
                this.distributions!['normal'], this.distributions!['poisson'], this.distributions!['binomial'],
            )
        )
      }
   }

   async fundAgents(){
    for(let i=0; i<this.agents!.length; i++){
        await this.contracts!['tokenA'].connect(this.godWallet!).transfer(this.agents![i].wallet.address, ethers.utils.parseUnits('0.0001', 18))
        await this.contracts!['tokenB'].connect(this.godWallet!).transfer(this.agents![i].wallet.address, ethers.utils.parseUnits('0.01', 18))
    }
   }

   async start(){

     console.log('Simulation started')
     const txt =  'Initialisation' + ' -> amountA: ' +  this.trackedResults[0]/10**18 + ' amountB: ' + this.trackedResults[1]/10**18 + '\n'
     this.printer!.printTxt(txt)
     await this.printer!.printCsv(this.step, this.trackedResults)

     this.stopwatch.start()

     while(this.step < this.simulationDuration)
     await this.takeStep()

     this.stopwatch.stop()
     console.log('Simulation duration: ' + (this.stopwatch.stop()/1000).toFixed(3) + 's')
   }

   async takeStep(){
     console.log('step: ' + this.step)
     for(let i =0; i<this.agents!.length; i++){
        await this.agents![i].takeStep()
     }
     this.step+=1
     await this.printer!.printCsv(this.step, this.trackedResults)
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