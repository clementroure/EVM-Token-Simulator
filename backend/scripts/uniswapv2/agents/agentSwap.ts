import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import AgentBase from '../../../engine/agentBase'
import Printer from "../../../engine/printer";

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

      await this.contracts!['tokenA'].approve(this.contracts!['uniswapV2Router'].address, Number.MAX_SAFE_INTEGER-1)
      await this.contracts!['tokenB'].approve(this.contracts!['uniswapV2Router'].address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        const tokenB_balance = await this.contracts!['tokenB'].callStatic.balanceOf(to)
        // console.log('UNI: ' + tokenA_balance / 10**18)
        // console.log('WETH: ' + tokenB_balance / 10**18)
  
        return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
      if(this.id < this.distributions!['poisson'][this.getStep()])
      await this.swapExactTokensForTokens()
    }

    async swapExactTokensForTokens() {

      let amountIn: number;
      let path: string[];
      //The minimum amount of output tokens that must be received for the transaction not to revert.
      const amountOutMin = 1
      // Recipient of the output tokens.
      const to = this.wallet.address
      // deadline
      const deadline = Math.floor(Date.now() / 1000) + 1000
      // ratio tokenA/tokenB
      let balances = await this.getBalance( this.contracts!['lpToken'].address)
      const tokenA_balance = balances[0]
      const tokenB_balance = balances[1]

      const _max = Math.max(tokenA_balance, tokenB_balance)
      const _min = _max == tokenA_balance ? tokenB_balance : tokenA_balance

      const ratio = _max / _min
      // constant value
      const c = 0.00000001*10**18
      // swap direction
      if(this.distributions!['binomial'][this.getStep()] == 1){
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()] * ratio)
        else
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()])

        path = [ this.contracts!['tokenA'].address,  this.contracts!['tokenB'].address]
      }
      else{
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()])
        else
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()] * ratio)

        path = [ this.contracts!['tokenB'].address,  this.contracts!['tokenA'].address]
      }

      await this.getBalance( this.wallet.address)

      const tx = await  this.contracts!['uniswapV2Router'].swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)

      balances = await this.getBalance( this.contracts!['lpToken'].address)

      const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**18 + '\n'
      this.printer!.printTxt(txt)

      this.setTrackedResults(this.name, balances)
    }
}

export default AgentSwap