import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import AgentBase from '../../../engine/agentBase'
import Printer from "../../../engine/printer";
import { ethers } from "hardhat";
const { testUtils } = require('hardhat')
const { block } = testUtils

class AgentSwap extends AgentBase {

    token_before: BigNumber = BigNumber.from(0)
    expectedAmountOut: BigNumber = BigNumber.from(0)
    decimals:number = 18

    constructor(
      name: string, parentPort:MessagePort | null, wallet: SignerWithAddress, printer: Printer,
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
    }

    async calculateSlippage() {

      // console.log('-- SLIPPAGE --')
      // console.log('amount BEFORE ' +  parseFloat(this.token_before.toString())/10**this.decimals)

      let token_amount_after: number
      if(this.decimals == 18)
      token_amount_after = parseFloat(await this.contracts!['tokenA'].callStatic.balanceOf(this.wallet.address))/10**this.decimals
      else
      token_amount_after = parseFloat(await this.contracts!['tokenB'].callStatic.balanceOf(this.wallet.address))/10**this.decimals

      // console.log('amount after : ' + token_amount_after)
  
      // slippage = (receivedAmount - expectedOutputAmount) / expectedOutputAmount
      const receivedAmount = token_amount_after - parseFloat(this.token_before.toString())/10**this.decimals
      // console.log(receivedAmount + ' received amount')

      // (B - A) / A * 100
      const B = Math.max(receivedAmount, parseFloat(this.expectedAmountOut.toString())/10**this.decimals )
      const A = Math.min(receivedAmount, parseFloat(this.expectedAmountOut.toString())/10**this.decimals )
      const dif = B-A

      console.log('Slippage : ' +((dif/A)*100).toFixed(8) + '% ')

      this.token_before = BigNumber.from(0)
      this.expectedAmountOut = BigNumber.from(0)
    }


    async takeStep(params?: any) {
      if(!params.checkSlippage){
        if(this.id < this.distributions!['poisson'][this.getStep()])
        await this.swapExactTokensForTokens(params)
      }
      else{
        if(!this.token_before.eq(0))
        this.calculateSlippage()
      }
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

      const poolPrice = Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)

      let agentAction = 0
      if(parseFloat(params.marketPrice) - poolPrice > params.epsilonPrice){
         agentAction = 1
      }
      else if(parseFloat(params.marketPrice) - poolPrice < -params.epsilonPrice){
         agentAction = 2
      }
      // sell weth
      if(agentAction == 2){
        const c = 0.1
        console.log('SELL WETH')
        amountIn = ethers.utils.parseUnits((c * this.distributions!['normal'][this.getStep()]).toString(), 18)
        // console.log(ethers.utils.formatUnits(amountIn,18) + '  amountIn')

        path = [ this.contracts!['tokenA'].address,  this.contracts!['tokenB'].address]

        const reserveIn = ethers.utils.parseUnits(balances[1].toString(), 0)
        const reserveOut = ethers.utils.parseUnits(balances[0].toString(), 0)

        // expectedOutputAmount = (inputAmount * reserveOut) / (reserveIn + inputAmount)
        this.expectedAmountOut = await this.contracts!['uniswapV2Router'].getAmountOut(amountIn, reserveIn, reserveOut)
        // console.log(ethers.utils.formatUnits(this.expectedAmountOut, 18) +  ' expecetd amount')

        // Price Impact
        const priceImpact = calculatePriceImpact(parseFloat(ethers.utils.formatUnits(reserveIn,6)), parseFloat(ethers.utils.formatUnits(reserveOut, 18)), parseFloat(ethers.utils.formatUnits(amountIn,6)), parseFloat(ethers.utils.formatUnits(this.expectedAmountOut,18)));
        console.log(`Price impact: ${priceImpact.toFixed(2)}%`)

        const data = {
          agent: this.name,
          action: "Sell WETH",
          value: priceImpact.toFixed(2)+ '%',
        };
        this.parentPort?.postMessage({ status: 'update', value: data})

        this.token_before = await this.contracts!['tokenB'].callStatic.balanceOf(to)
        this.decimals = 6

        // swap
        await  this.contracts!['uniswapV2Router'].swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)  
        // await block.advance()

        // print

        balances = await this.contracts!['pair'].getReserves()
        const poolPrice = (Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)).toFixed(2)

        const txt =  (this.getStep()) + ': SELL : ' + this.name + ' -> Market: ' +  params.marketPrice + ' Pool: ' + poolPrice + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, [params.marketPrice, poolPrice])
      }
      // buy weth
      else if(agentAction == 1){
        console.log('BUY WETH')
        const c = 180
        amountIn = ethers.utils.parseUnits((c * this.distributions!['normal'][this.getStep()]).toFixed(6).toString(), 6)
        // console.log(ethers.utils.formatUnits(amountIn,6) + '  amountIn')

        path = [ this.contracts!['tokenB'].address,  this.contracts!['tokenA'].address]

        const reserveIn = ethers.utils.parseUnits(balances[0].toString(), 0)
        const reserveOut = ethers.utils.parseUnits(balances[1].toString(), 0)

        // expectedOutputAmount = (inputAmount * reserveOut) / (reserveIn + inputAmount)
        this.expectedAmountOut = await this.contracts!['uniswapV2Router'].getAmountOut(amountIn, reserveIn, reserveOut)
        // console.log(ethers.utils.formatUnits(this.expectedAmountOut, 18) +  ' expected amount')

        // Price Impact
        const priceImpact = calculatePriceImpact(parseFloat(ethers.utils.formatUnits(reserveIn,6)), parseFloat(ethers.utils.formatUnits(reserveOut, 18)), parseFloat(ethers.utils.formatUnits(amountIn,6)), parseFloat(ethers.utils.formatUnits(this.expectedAmountOut,18)));
        console.log(`Price impact: ${priceImpact.toFixed(2)}%`)

        const data = {
          agent: this.name,
          action: "Buy WETH",
          value: priceImpact.toFixed(2)+ '%',
        };
        this.parentPort?.postMessage({ status: 'update', value: data})

        this.token_before = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        this.decimals = 18
        
        // swap
        await  this.contracts!['uniswapV2Router'].swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)
        // await block.advance()

        // print

        balances = await this.contracts!['pair'].getReserves()
        const poolPrice = (Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)).toFixed(2)

        const txt =  (this.getStep()) + ': BUY  : ' + this.name + ' -> Market: ' +  params.marketPrice + ' Pool: ' + poolPrice + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, [params.marketPrice, poolPrice])
      } else {
        // just wait and print
        balances = await this.contracts!['pair'].getReserves()
        const poolPrice = (Math.max(tokenA_balance, tokenB_balance) / Math.min(tokenA_balance, tokenB_balance)).toFixed(2)

        const txt =  (this.getStep()) + ': WAIT : ' + this.name + ' -> Market: ' +  params.marketPrice + ' Pool: ' + poolPrice + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, [params.marketPrice, poolPrice])
      }
    }

  }
  
  function calculatePriceImpact(reserveIn: number, reserveOut: number, amountIn: number, amountOut: number): number {
    // Calculate the ideal output amount according to the current reserve ratio
    const idealAmountOut = (reserveOut * amountIn) / reserveIn;

    // Calculate price impact
    const priceImpact = ((idealAmountOut - amountOut) / idealAmountOut) * 100;

    return priceImpact;
  }

  function maxBigInt(a: BigNumber, b: BigNumber) {
    return a > b ? a : b;
  }
  function minBigInt(a: BigNumber, b: BigNumber) {
    return a < b ? a : b;
  }

export default AgentSwap