import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { nearestUsableTick } from '@uniswap/v3-sdk'; // lots of maths without this lib
import Printer from "../../../engine/printer";
import AgentBase from "../../../engine/agentBase";

class AgentLiquidity extends AgentBase {
    // lp nft token id
    liquidityTokenId: number;

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
      this.liquidityTokenId = -1

      this.init()
    }

    async init(){

      await this.contracts!['tokenA'].approve(this.contracts!['uniswapV3NonFungiblePositionManager'].address, Number.MAX_SAFE_INTEGER-1)
      await this.contracts!['tokenA'].approve(this.contracts!['uniswapV3NonFungiblePositionManager'].address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        const tokenB_balance = await this.contracts!['tokenB'].callStatic.balanceOf(to)
  
        return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
      if(this.liquidityTokenId == -1)
      await this.mint()
      else{
        if(this.distributions!['binomial'][this.getStep()] == 1)
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

      const amountADesired = Math.round(c * this.distributions!['normal'][this.getStep()] * ratio)
      const amountBDesired = Math.round(c * this.distributions!['normal'][this.getStep()])

      return [amountADesired, amountBDesired]
    }

    async mint() {

      const poolData = await this.getPoolData(this.contracts!['uniswapV3Pool'])
      
      const amountDesired = await this.getAmountDesired(this.contracts!['uniswapV3Pool'].address)

      // mint a new position to add liquidity
      const params = {
        token0: this.contracts!['tokenA'].address,
        token1:  this.contracts!['tokenB'].address,
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

      const tx = await this.contracts!['uniswapV3NonFungiblePositionManager'].mint(params)
      const rc = await tx.wait() 
      const event = rc.events.find((event: { event: string; }) => event.event === 'Transfer');
      const [from, to, value] = event.args;

      this.liquidityTokenId = parseInt(value);
      console.log('MINTED ', this.liquidityTokenId)

      this.updatePool(this.contracts!['uniswapV3Pool'].address)
    }

    async increaseLiquidity(){

      // verify if pool exist
      const pairPoolAddress = await this.contracts!['uniswapV3Pool'].callStatic.getPool( this.contracts!['tokenA'].address,  this.contracts!['tokenB'].address, 3000)

      const amountDesired = await this.getAmountDesired(pairPoolAddress)

      const params = {
        tokenId: this.liquidityTokenId,
        amount0Desired: amountDesired[0],
        amount1Desired: amountDesired[1],
        amount0Min: 1,
        amount1Min: 1,
        deadline:  (await ethers.provider.getBlock("latest")).timestamp + 3
      }

      const tx = await this.contracts!['uniswapV3NonFungiblePositionManager'].increaseLiquidity(params)

      this.updatePool(pairPoolAddress)
    }

    async decreaseLiquidity(){

      const res = await this.contracts!['uniswapV3NonFungiblePositionManager'].callStatic.positions(this.liquidityTokenId)

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

      const tx = await this.contracts!['uniswapV3NonFungiblePositionManager'].decreaseLiquidity(params)
    }

    async updatePool(poolAddress: string) {

      const balances = await this.getBalance(poolAddress)

      const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**18 + '\n'
      this.printer!.printTxt(txt)

      this.setTrackedResults(this.name, balances)
    }
}

export default AgentLiquidity