import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
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

    async takeStep(params?: any) {
      if(this.id < this.distributions!['poisson'][this.getStep()])
      await this.swapExactTokensForTokens(params)
    }

    async swapExactTokensForTokens(params?: any) {
      // console.log('ACTION : ' + action) // 2 = sell, 1 = buy, 0 = wait
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
      const tokenA_balance = balances[1] / 10**18
      const tokenB_balance = balances[0] / 10**6

      // console.log()
      // console.log(tokenA_balance / 10**18)
      // console.log(tokenB_balance / 10**6)
      const poolPrice = Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)
      // console.log('WETH = $' + poolPrice)
      // console.log()
      // console.log('WETH : ' + await this.contracts!['tokenA'].callStatic.balanceOf(to)/ 10**18)
      // console.log('USDT : ' + await this.contracts!['tokenB'].callStatic.balanceOf(to)/ 10**6)
 
      let agentAction = 0
      if(parseFloat(params.marketPrice) - poolPrice > params.epsilonPrice){
         agentAction = 1
      }
      else if(parseFloat(params.marketPrice) - poolPrice < -params.epsilonPrice){
         agentAction = 2
      }

      // sell weth
      if(agentAction == 2){
        // constant value
        const c = 0.1
        amountIn = ethers.utils.parseUnits((c * this.distributions!['normal'][this.getStep()]).toString(), 18)

        path = [ this.contracts!['tokenA'].address,  this.contracts!['tokenB'].address]

        await  this.contracts!['uniswapV2Router'].swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)

        balances = await this.contracts!['pair'].getReserves()
        const poolPrice = (Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)).toFixed(2)

        const txt =  (this.getStep()) + ': SELL : ' + this.name + ' -> Market: ' +  params.marketPrice + ' Pool: ' + poolPrice + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, [params.marketPrice, poolPrice])
      }
      // buy weth
      else if(agentAction == 1){
        // constant value
        const c = 180
        amountIn = ethers.utils.parseUnits((c * this.distributions!['normal'][this.getStep()]).toFixed(6).toString(), 6)

        path = [ this.contracts!['tokenB'].address,  this.contracts!['tokenA'].address]

        // SLIPPAGE
        const reserveIn = ethers.utils.parseUnits(balances[1].toString(), 0)
        const reserveOut = ethers.utils.parseUnits(balances[0].toString(), 0)

        const amountOut = (getAmountOut(amountIn, reserveIn, reserveOut)).toFixed(6)

        // console.log(amountIn, reserveIn, reserveOut)
        const tokenA_before = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        // console.log('WETH before:' + tokenA_before)
        // console.log(`Amount out: ${ethers.utils.parseUnits(amountOut, 18)}`);
        // console.log('WETH expected:' + (tokenA_before.add(ethers.utils.parseUnits(amountOut, 18))))

        await  this.contracts!['uniswapV2Router'].swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)

        // slippage
        const expectedFinalAmount = tokenA_before.add(ethers.utils.parseUnits(amountOut, 18))
        const finalAmount = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        // console.log(expectedFinalAmount, finalAmount)

        const difference = expectedFinalAmount.sub(finalAmount)
        // console.log(difference)

        const slipppage = ((difference / expectedFinalAmount) * 100).toFixed(3)

        // console.log('WETH I have:' + (await this.contracts!['tokenA'].callStatic.balanceOf(to)) + ' %')

        console.log('Slippage : ' + slipppage + ' %')

        balances = await this.contracts!['pair'].getReserves()
        const poolPrice = (Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)).toFixed(2)

        const txt =  (this.getStep()) + ': BUY  : ' + this.name + ' -> Market: ' +  params.marketPrice + ' Pool: ' + poolPrice + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, [params.marketPrice, poolPrice])
      } else {
        balances = await this.contracts!['pair'].getReserves()
        const poolPrice = (Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)).toFixed(2)

        const txt =  (this.getStep()) + ': WAIT : ' + this.name + ' -> Market: ' +  params.marketPrice + ' Pool: ' + poolPrice + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, [params.marketPrice, poolPrice])
      }
    }

  }

// Estimate the amount of token the agent should receive if 0 slippage
function getAmountOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) {
  const amountInWithFee = amountIn.mul(997) // 0.3 % fee on each swap
  const numerator = amountInWithFee.mul(reserveOut)
  const denominator = reserveIn.mul(1000).add(amountInWithFee)
  
  const amountOut = Number(numerator) / Number(denominator)
  
  return amountOut
}


export default AgentSwap