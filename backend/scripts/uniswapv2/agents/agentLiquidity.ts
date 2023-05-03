import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { testUtils } from 'hardhat';
import { ethers } from "hardhat"; 
import AgentBase from "../../../engine/agentBase";
import Printer from "../../../engine/printer";
const { block } = testUtils

class AgentLiquidity extends AgentBase{
 
    constructor(
      name: string, wallet: SignerWithAddress,  printer: Printer, 
      getStep: Function, setTrackedResults: Function,
      uniswapV2Router: Contract ,uniswapV2Factory: Contract, tokenA: Contract, tokenB: Contract, lpToken: Contract,
      normalDistribution: number[], poissonDistribution: number[], binomialDistribution: number[],
      ) {
      super(
        name,
        wallet, 
        printer,
        getStep,
        setTrackedResults,
        [
          {name: 'normal', distribution: normalDistribution},
          {name: 'poisson', distribution: poissonDistribution},
          {name: 'binomial', distribution: binomialDistribution}
        ],
        [
          {name: 'uniswapV2Router', contract: uniswapV2Router},
          {name: 'uniswapV2Factory', contract: uniswapV2Factory},
          {name: 'lpToken', contract: lpToken},
          {name: 'tokenA', contract: tokenA},
          {name: 'tokenB', contract: tokenB}
        ]
      )

      this.init()
    }

    async init(){

      await this.contracts!['tokenA'].approve(this.contracts!['uniswapV2Router'].address, Number.MAX_SAFE_INTEGER-1)
      await this.contracts!['tokenB'].approve(this.contracts!['uniswapV2Router'].address, Number.MAX_SAFE_INTEGER-1)
      await this.contracts!['lpToken'].approve(this.contracts!['uniswapV2Router'].address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

      const tokenA_balance = await this.contracts!['tokenA'].callStatic.balanceOf(to)
      const tokenB_balance = await this.contracts!['tokenB'].callStatic.balanceOf(to)

      // console.log('UNI: ' + tokenA_balance / 10**18)
      // console.log('WETH: ' + tokenB_balance / 10**18)

      return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
      if(this.distributions!['binomial'][this.getStep()] == 1)
      await this.addLiquidity()
      else if(await this.contracts!['lpToken'].callStatic.balanceOf(this.wallet.address) > 0)
      await this.removeLiquidity()
    }

    async addLiquidity() {

        let balances = await this.getBalance(this.contracts!['lpToken'].address)
        const tokenA_balance = balances[0]
        const tokenB_balance = balances[1]
  
        const _max = Math.max(tokenA_balance, tokenB_balance)
        const _min = _max == tokenA_balance ? tokenB_balance : tokenA_balance
  
        const ratio = _max / _min

        const c = 0.0000001*10**18

        const amountADesired = Math.round(c * this.distributions!['normal'][this.getStep()] * ratio)
        const amountBDesired = Math.round(c * this.distributions!['normal'][this.getStep()])

        const amountAMin = 1
        const amountBMin = 1

        const to = this.wallet.address;
        const deadline = (await ethers.provider.getBlock("latest")).timestamp + 300

        const tx = await this.contracts!['uniswapV2Router'].addLiquidity(this.contracts!['tokenA'].address, this.contracts!['tokenB'].address, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)

        balances = await this.getBalance(this.wallet.address)

        this.setTrackedResults(this.name, balances)
    }

    async removeLiquidity() {

        const amountAMin = 1
        const amountBMin = 1
        
        const to = this.wallet.address;
        const deadline =  (await ethers.provider.getBlock("latest")).timestamp + 300

        const liquidity = await this.contracts!['lpToken'].callStatic.balanceOf(to)

        const tx = await this.contracts!['uniswapV2Router'].removeLiquidity(this.contracts!['tokenA'].address, this.contracts!['tokenB'].address, liquidity, amountAMin, amountBMin, to, deadline)

        const balances = await this.getBalance(this.contracts!['lpToken'].address)

        const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**18 + '\n'
        this.printer!.printTxt(txt)

        this.setTrackedResults(this.name, balances)
    }
}

export default AgentLiquidity