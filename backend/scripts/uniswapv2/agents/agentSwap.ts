import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { testUtils } from 'hardhat';
import { ethers } from "hardhat";
const { block } = testUtils

class AgentSwap {
    name: string;
    id: number;
    wallet: SignerWithAddress;
    uniswapV2Router: Contract;
    uniswapV2Factory: Contract;
    tokenA: Contract;
    tokenB: Contract;
    lpToken: Contract;
    normalDistribution: number[];
    poissonDistribution: number[];
    binomialDistribution: number[];
    getStep: Function;
    getCurrentBlock: Function;
    setLiquidityPool: Function;
  
    constructor(
      name: string, wallet: SignerWithAddress, godWallet: SignerWithAddress, uniswapV2Router: Contract, 
      uniswapV2Factory: Contract, tokenA: Contract, tokenB: Contract, lpToken: Contract,
      normalDistribution: number[], poissonDistribution: number[], binomialDistribution: number[],
      getStep: Function, getCurrentBlock: Function, setLiquidtyPool: Function
      ) {
      this.name = name;
      this.id = parseInt(name.slice(-1));
      this.wallet = wallet;
      this.uniswapV2Router = uniswapV2Router.connect(wallet);
      this.uniswapV2Factory = uniswapV2Factory.connect(wallet);
      this.tokenA = tokenA.connect(wallet);
      this.tokenB = tokenB.connect(wallet);
      this.lpToken = lpToken;
      this.normalDistribution = normalDistribution;
      this.poissonDistribution = poissonDistribution;
      this.binomialDistribution = binomialDistribution;
      this.getStep = getStep;
      this.getCurrentBlock = getCurrentBlock;
      this.setLiquidityPool = setLiquidtyPool;

      // this.tokenA.approve(wallet.address, ethers.utils.parseUnits('0.004', 18))
      // this.tokenB.approve(wallet.address, ethers.utils.parseUnits('0.001', 18))

      // this.tokenA.transferFrom(godWallet.address, wallet.address, ethers.utils.parseUnits('0.004', 18)) 
      // this.tokenB.transferFrom(godWallet.address, wallet.address, ethers.utils.parseUnits('0.001', 18)) 

      this.init()
    }

    async init(){

      await this.tokenA.approve(this.uniswapV2Router.address, Number.MAX_SAFE_INTEGER-1)
      await this.tokenB.approve(this.uniswapV2Router.address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.tokenA.callStatic.balanceOf(to)
        const tokenB_balance = await this.tokenB.callStatic.balanceOf(to)
  
        // console.log('UNI: ' + tokenA_balance / 10**18)
        // console.log('WETH: ' + tokenB_balance / 10**18)
  
        return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
      if(this.id < this.poissonDistribution[this.getStep()])
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
      const deadline = (await ethers.provider.getBlock("latest")).timestamp + 300
      // ratio tokenA/tokenB
      const balances = await this.getBalance(this.lpToken.address)
      const tokenA_balance = balances[0]
      const tokenB_balance = balances[1]

      const _max = Math.max(tokenA_balance, tokenB_balance)
      const _min = _max == tokenA_balance ? tokenB_balance : tokenA_balance

      const ratio = _max / _min
      // constant value
      const c = 0.00000001*10**18
      // swap direction
      if(this.binomialDistribution[this.getStep()] == 1){
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.normalDistribution[this.getStep()] * ratio)
        else
        amountIn = Math.round(c * this.normalDistribution[this.getStep()])

        path = [this.tokenA.address, this.tokenB.address]
      }
      else{
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.normalDistribution[this.getStep()])
        else
        amountIn = Math.round(c * this.normalDistribution[this.getStep()] * ratio)

        path = [this.tokenB.address, this.tokenA.address]
      }

      const tx = await this.uniswapV2Router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)

      const balances2 = await this.getBalance(this.lpToken.address)
      const tokenA_balance2 = balances2[0]
      const tokenB_balance2 = balances2[1]

      this.setLiquidityPool(this.name, tokenA_balance2, tokenB_balance2)
    }
}

export default AgentSwap