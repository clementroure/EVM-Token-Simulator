import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat"; 
import AgentBase from "../../../engine/agentBase";
import Printer from "../../../engine/printer";

class AgentLiquidity extends AgentBase{
 
    constructor(
      name: string, parentPort:MessagePort | null, wallet: SignerWithAddress,  printer: Printer, 
      getStep: Function, setTrackedResults: Function,
      distributions?: { [key: string]: number[] }, contracts?: { [key: string]: Contract }
      ) {
      super(
        name,
        parentPort,
        wallet, 
        printer,
        getStep,
        setTrackedResults,
        distributions,
        contracts
      )

      this.init()
    }

    async init(){
      
      await this.contracts!['tokenA'].approve(this.contracts!['uniswapV2Router'].address, ethers.utils.parseUnits('10000', 18))
      await this.contracts!['tokenB'].approve(this.contracts!['uniswapV2Router'].address, ethers.utils.parseUnits('10000', 18))
      await this.contracts!['pair'].approve(this.contracts!['uniswapV2Router'].address, ethers.utils.parseUnits('10000', 18))

      await this.addLiquidity()
    }
  
    async takeStep() {
      // if(this.distributions!['binomial'][this.getStep()] == 1)
      // await this.addLiquidity()
      // else if(await this.contracts!['pair'].callStatic.balanceOf(this.wallet.address) > 0)
      // await this.removeLiquidity()

      let balances = await this.contracts!['pair'].getReserves()
      const tokenA_balance = balances[1] / 10**18
      const tokenB_balance = balances[0] / 10**6
      const ratio = Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)

      // console.log('ratio : ' + ratio)
      const loss = this.calculateImpermanentLoss(1800, ratio).toFixed(8)
      console.log('Loss : ' + loss + ' %')

      const txt =  (this.getStep()) + ': Impermanent Loss : ' + loss + ' %' + '\n'
      this.printer!.printTxt(txt)
      // this.setTrackedResults(this.name, balances)
    }

    async addLiquidity() {
  
        const amountADesired = ethers.utils.parseUnits('1', 18); // add 1 WETH
        const amountBDesired = ethers.utils.parseUnits('1800', 6); // add 1800 USDT

        const amountAMin = 1
        const amountBMin = 1

        const to = this.wallet.address;
        const deadline = Math.floor(Date.now() / 1000) + (60*10) // 10 min from UNISX time

        await this.contracts!['uniswapV2Router'].addLiquidity(this.contracts!['tokenA'].address, this.contracts!['tokenB'].address, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)
    }

    async removeLiquidity() {

        const amountAMin = 1
        const amountBMin = 1
        
        const to = this.wallet.address;
        const deadline =  Math.floor(Date.now() / 1000) + (60*10)

        const liquidity = await this.contracts!['pair'].callStatic.balanceOf(to)

        await this.contracts!['uniswapV2Router'].removeLiquidity(this.contracts!['tokenA'].address, this.contracts!['tokenB'].address, liquidity, amountAMin, amountBMin, to, deadline)

        // const balances = await this.getBalance(this.contracts!['pair'].address)

        // const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**18 + '\n'
        // this.printer!.printTxt(txt)

        // this.setTrackedResults(this.name, balances)
    }


    calculateImpermanentLoss(initialRatio: number, currentRatio: number): number {
      // Price ratio
      let priceRatio = currentRatio / initialRatio;
  
      // Impermanent loss formula
      let IL = 1 - (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);  
      // Returns impermanent loss as a percentage
      return IL * 100;
    }
}

export default AgentLiquidity