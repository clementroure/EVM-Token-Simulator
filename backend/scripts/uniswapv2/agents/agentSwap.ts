import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import AgentBase from '../../../engine/agentBase'
import Printer from "../../../engine/printer";
import { ethers } from "hardhat";

class AgentSwap extends AgentBase {

    constructor(
      name: string, wallet: SignerWithAddress, printer: Printer,
      getStep: Function, setTrackedResults: Function,
      distributions?: { [key: string]: number[] }, contracts?: { [key: string]: Contract }
      ) {
      super(
        name,
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
    }

    async takeStep() {
      if(this.id < this.distributions!['poisson'][this.getStep()])
      await this.swapExactTokensForTokens()
    }

    async swapExactTokensForTokens() {

      let amountIn;
      let path: string[];
      //The minimum amount of output tokens that must be received for the transaction not to revert.
      const amountOutMin = 1
      // Recipient of the output tokens.
      const to = this.wallet.address
      // deadline
      const deadline = Math.floor(Date.now() / 1000) + (60*10)
      // ratio tokenA/tokenB
      let balances = await this.contracts!['pair'].getReserves()
      const tokenA_balance = balances[1]
      const tokenB_balance = balances[0]

      console.log()
      console.log(tokenA_balance / 10**18)
      console.log(tokenB_balance / 10**6)

      console.log()
      console.log('WETH : ' + await this.contracts!['tokenA'].callStatic.balanceOf(to)/ 10**18)
      console.log('USDT : ' + await this.contracts!['tokenB'].callStatic.balanceOf(to)/ 10**6)

      // swap direction
      if(this.distributions!['binomial'][this.getStep()] == 1){
        // constant value
        const c = 0.01
        amountIn = ethers.utils.parseUnits((c * this.distributions!['normal'][this.getStep()]).toString(), 18)

        path = [ this.contracts!['tokenA'].address,  this.contracts!['tokenB'].address]
      }
      else{
        // constant value
        const c = 18
        amountIn = ethers.utils.parseUnits((c * this.distributions!['normal'][this.getStep()]).toFixed(6).toString(), 6)

        path = [ this.contracts!['tokenB'].address,  this.contracts!['tokenA'].address]
      }

      await  this.contracts!['uniswapV2Router'].swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)

      balances = await this.contracts!['pair'].getReserves()

      const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[1]/10**18 + ' amountB: ' + balances[0]/10**6 + '\n'
      this.printer!.printTxt(txt)

      this.setTrackedResults(this.name, balances)
    }

  }

export default AgentSwap