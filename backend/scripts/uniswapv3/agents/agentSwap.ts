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

      await this.contracts!['tokenA'].approve(this.contracts!['uniswapV3SwapRouter'].address, ethers.utils.parseUnits('10000', 18))
      await this.contracts!['tokenB'].approve(this.contracts!['uniswapV3SwapRouter'].address, ethers.utils.parseUnits('10000', 18))
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        const tokenB_balance = await this.contracts!['tokenB'].callStatic.balanceOf(to)
        // console.log('UNI: ' + tokenA_balance / 10**18)
        // console.log('WETH: ' + tokenB_balance / 10**18)
  
        return [tokenA_balance, tokenB_balance]
    }

    async getPoolData(poolContract: Contract) {
      const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
      ])
    
      return {
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
      }
    }
  
    async takeStep() {
      
      await this.swapExactInputSingle()
    }

    async getAmountDesired(poolAddress: string){

      const balances = await this.getBalance(poolAddress)
      const tokenA_balance = balances[0]
      const tokenB_balance = balances[1]

      const _max = Math.max(tokenA_balance, tokenB_balance)
      const _min = _max == tokenA_balance ? tokenB_balance : tokenA_balance

      const ratio = _max / _min
      // constant value
      const c = 0.000000001*10**18
      let amountIn: number;
      // swap direction
      if(this.distributions!['binomial'][this.getStep()] == 1){
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()] * ratio)
        else
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()])
      }
      else{
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()])
        else
        amountIn = Math.round(c * this.distributions!['normal'][this.getStep()] * ratio)
      }

      return amountIn
    }

    async swapExactInputSingle() {

      const poolData = await this.getPoolData(this.contracts!['uniswapV3Pool'])
      
      const amountDesired = await this.getAmountDesired(this.contracts!['uniswapV3Pool'].address)
      
      // 
      const params = {
        tokenIn: this.contracts!['tokenA'].address,
        tokenOut: this.contracts!['tokenB'].address,
        fee: poolData.fee,
        amountIn: amountDesired,
        amountOutMinimum : 1,
        sqrtPriceLimitX96: 0,
        recipient: this.wallet.address,
        deadline: Math.floor(Date.now() / 1000) + (60*10)
      }

      const tx = await this.contracts!['uniswapV3SwapRouter'].exactInputSingle(params)

      this.updatePool(this.contracts!['uniswapV3Pool'].address)
    }

    async updatePool(poolAddress: string) {

      const balances = await this.getBalance(poolAddress)

      const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**18 + '\n'
      this.printer!.printTxt(txt)

      this.setTrackedResults(this.name, balances)
    }

}

export default AgentSwap