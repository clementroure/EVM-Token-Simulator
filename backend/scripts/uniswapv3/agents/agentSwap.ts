import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

class AgentSwap {
    name: string;
    id: number;
    wallet: SignerWithAddress;
    UniswapV3Pool: Contract;
    UniswapV3SwapRouter: Contract;
    UniswapV3Factory: Contract;
    tokenA: Contract;
    tokenB: Contract;
    normalDistribution: number[];
    poissonDistribution: number[];
    binomialDistribution: number[];
    getStep: Function;
    getCurrentBlock: Function;
    setLiquidityPool: Function;
  
    constructor(
      name: string, wallet: SignerWithAddress, godWallet: SignerWithAddress, UniswapV3Pool: Contract,
      UniswapV3SwapRouter: Contract, UniswapV3Factory: Contract, tokenA: Contract, tokenB: Contract, 
      normalDistribution: number[], poissonDistribution: number[], binomialDistribution: number[],
      getStep: Function, getCurrentBlock: Function, setLiquidtyPool: Function
      ) {
      this.name = name;
      this.id = parseInt(name.slice(-1));
      this.wallet = wallet;
      this.UniswapV3Pool = UniswapV3Pool.connect(wallet);UniswapV3Pool
      this. UniswapV3SwapRouter =  UniswapV3SwapRouter.connect(wallet);
      this.UniswapV3Factory = UniswapV3Factory.connect(wallet);
      this.tokenA = tokenA.connect(wallet);
      this.tokenB = tokenB.connect(wallet);
      this.normalDistribution = normalDistribution;
      this.poissonDistribution = poissonDistribution;
      this.binomialDistribution = binomialDistribution;
      this.getStep = getStep;
      this.getCurrentBlock = getCurrentBlock;
      this.setLiquidityPool = setLiquidtyPool;

      this.init()
    }

    async init(){

      await this.tokenA.approve(this.UniswapV3SwapRouter.address, Number.MAX_SAFE_INTEGER-1)
      await this.tokenB.approve(this.UniswapV3SwapRouter.address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.tokenA.callStatic.balanceOf(to)
        const tokenB_balance = await this.tokenB.callStatic.balanceOf(to)
  
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
      if(this.binomialDistribution[this.getStep()] == 1){
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.normalDistribution[this.getStep()] * ratio)
        else
        amountIn = Math.round(c * this.normalDistribution[this.getStep()])
      }
      else{
        if(tokenA_balance > tokenB_balance)
        amountIn = Math.round(c * this.normalDistribution[this.getStep()])
        else
        amountIn = Math.round(c * this.normalDistribution[this.getStep()] * ratio)
      }

      return amountIn
    }

    async swapExactInputSingle() {

      const poolData = await this.getPoolData(this.UniswapV3Pool)
      
      const amountDesired = await this.getAmountDesired(this.UniswapV3Pool.address)
      
      // 
      const params = {
        tokenIn: this.tokenA.address,
        tokenOut: this.tokenB.address,
        fee: poolData.fee,
        amountIn: amountDesired,
        amountOutMinimum : 1,
        sqrtPriceLimitX96: 0,
        recipient: this.wallet.address,
        deadline: (await ethers.provider.getBlock("latest")).timestamp + 3
      }

      const tx = await this. UniswapV3SwapRouter.exactInputSingle(params)

      this.updatePool(this.UniswapV3Pool.address)
    }

    async updatePool(poolAddress: string) {

      const balances = await this.getBalance(poolAddress)
      const tokenA_balance = balances[0]
      const tokenB_balance = balances[1]

      console.log(balances)

      this.setLiquidityPool(this.name, tokenA_balance, tokenB_balance)
    }

}

export default AgentSwap