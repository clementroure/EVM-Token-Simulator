import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import uniswapV3PoolABI from '../../../abi/uniswapV3Pool.json'
import { nearestUsableTick } from '@uniswap/v3-sdk'; // lots of maths without this lib

class AgentLiquidity {
    name: string;
    id: number;
    wallet: SignerWithAddress;
    UniswapV3Pool: Contract;
    UniswapV3NonFungiblePositionManager: Contract;
    UniswapV3Factory: Contract;
    tokenA: Contract;
    tokenB: Contract;
    normalDistribution: number[];
    poissonDistribution: number[];
    binomialDistribution: number[];
    getStep: Function;
    getCurrentBlock: Function;
    setLiquidityPool: Function;
    liquidityTokenId: number;
  
    constructor(
      name: string, wallet: SignerWithAddress, godWallet: SignerWithAddress, UniswapV3Pool: Contract, 
      UniswapV3NonFungiblePositionManager: Contract, UniswapV3Factory: Contract, tokenA: Contract, tokenB: Contract, 
      normalDistribution: number[], poissonDistribution: number[], binomialDistribution: number[],
      getStep: Function, getCurrentBlock: Function, setLiquidtyPool: Function
      ) {
      this.name = name;
      this.id = parseInt(name.slice(-1));
      this.wallet = wallet;
      this.UniswapV3Pool = UniswapV3Pool.connect(wallet);
      this.UniswapV3NonFungiblePositionManager = UniswapV3NonFungiblePositionManager.connect(wallet);
      this.UniswapV3Factory = UniswapV3Factory.connect(wallet);
      this.tokenA = tokenA.connect(wallet);
      this.tokenB = tokenB.connect(wallet);
      this.normalDistribution = normalDistribution;
      this.poissonDistribution = poissonDistribution;
      this.binomialDistribution = binomialDistribution;
      this.getStep = getStep;
      this.getCurrentBlock = getCurrentBlock;
      this.setLiquidityPool = setLiquidtyPool;
      this.liquidityTokenId = -1;

      this.init()
    }

    async init(){

      await this.tokenA.approve(this.UniswapV3NonFungiblePositionManager.address, Number.MAX_SAFE_INTEGER-1)
      await this.tokenB.approve(this.UniswapV3NonFungiblePositionManager.address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.tokenA.callStatic.balanceOf(to)
        const tokenB_balance = await this.tokenB.callStatic.balanceOf(to)
  
        return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
      if(this.liquidityTokenId == -1)
      await this.mint()
      else{
        if(this.binomialDistribution[this.getStep()] == 1)
        await this.increaseLiquidity()
        else
        await this.decreaseLiquidity()
      }
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

    async getAmountDesired(poolAddress: string){

      // get amount desired
      const balances = await this.getBalance(poolAddress)
      const tokenA_balance = balances[0]
      const tokenB_balance = balances[1]

      const _max = Math.max(tokenA_balance, tokenB_balance)
      const _min = _max == tokenA_balance ? tokenB_balance : tokenA_balance

      const ratio = _max / _min

      const c = 0.0000001*10**18

      const amountADesired = Math.round(c * this.normalDistribution[this.getStep()] * ratio)
      const amountBDesired = Math.round(c * this.normalDistribution[this.getStep()])

      return [amountADesired, amountBDesired]
    }

    async mint() {

      const poolData = await this.getPoolData(this.UniswapV3Pool)
      
      const amountDesired = await this.getAmountDesired(this.UniswapV3Pool.address)

      // mint a new position to add liquidity
      const params = {
        token0: this.tokenA.address,
        token1: this.tokenB.address,
        fee: poolData.fee,
        tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
        tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
        amount0Desired: amountDesired[0],
        amount1Desired: amountDesired[1],
        amount0Min: 1,
        amount1Min: 1,
        recipient: this.wallet.address,
        deadline: Math.floor(Date.now() / 1000) + (60*10)
      }

      const tx = await this.UniswapV3NonFungiblePositionManager.mint(params)
      const rc = await tx.wait() 
      const event = rc.events.find((event: { event: string; }) => event.event === 'Transfer');
      const [from, to, value] = event.args;

      this.liquidityTokenId = parseInt(value);
      console.log('MINTED ', this.liquidityTokenId)

      this.updatePool(this.UniswapV3Pool.address)
    }

    async increaseLiquidity(){

      // verify if pool exist
      const pairPoolAddress = await this.UniswapV3Factory.callStatic.getPool(this.tokenA.address, this.tokenB.address, 3000)

      const amountDesired = await this.getAmountDesired(pairPoolAddress)

      const params = {
        tokenId: this.liquidityTokenId,
        amount0Desired: amountDesired[0],
        amount1Desired: amountDesired[1],
        amount0Min: 1,
        amount1Min: 1,
        deadline:  (await ethers.provider.getBlock("latest")).timestamp + 3
      }

      const tx = await this.UniswapV3NonFungiblePositionManager.increaseLiquidity(params)

      this.updatePool(pairPoolAddress)
    }

    async decreaseLiquidity(){

      const res = await this.UniswapV3NonFungiblePositionManager.callStatic.positions(this.liquidityTokenId)

      const totalLiquidity= res.liquidity
      console.log('Liquidity will decrease from ', totalLiquidity)

      if(totalLiquidity == 0){
        return;
      }

      const halfLiquidity= BigInt(Math.round(res.liquidity / 2))

      const params = {
        tokenId: this.liquidityTokenId,
        liquidity: halfLiquidity,
        amount0Min: 1,
        amount1Min: 1,
        deadline:  (await ethers.provider.getBlock("latest")).timestamp + 3
      }

      const tx = await this.UniswapV3NonFungiblePositionManager.decreaseLiquidity(params)
    }

    async updatePool(poolAddress: string) {

      const balances = await this.getBalance(poolAddress)
      const tokenA_balance = balances[0]
      const tokenB_balance = balances[1]

      console.log(balances)

      this.setLiquidityPool(this.name, tokenA_balance, tokenB_balance)
    }
}

export default AgentLiquidity