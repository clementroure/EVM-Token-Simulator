import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { testUtils } from 'hardhat';
import { ethers } from "hardhat"; // PTN il y a un ethers from ethers et un ethers from hardhat
const { block } = testUtils

class AgentLiquidity {
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
      if(this.binomialDistribution[this.getStep()] == 1)
      await this.addLiquidity()
      else if(await this.lpToken.callStatic.balanceOf(this.wallet.address) > 0)
      await this.removeLiquidity()
    }

    async addLiquidity() {

        const balances = await this.getBalance(this.lpToken.address)
        const tokenA_balance = balances[0]
        const tokenB_balance = balances[1]
  
        const _max = Math.max(tokenA_balance, tokenB_balance)
        const _min = _max == tokenA_balance ? tokenB_balance : tokenA_balance
  
        const ratio = _max / _min

        const c = 0.0000001*10**18

        const amountADesired = Math.round(c * this.normalDistribution[this.getStep()] * ratio)
        const amountBDesired = Math.round(c * this.normalDistribution[this.getStep()])

        const amountAMin = 1
        const amountBMin = 1

        const to = this.wallet.address;
        const deadline = (await ethers.provider.getBlock("latest")).timestamp + 300

        const tx = await this.uniswapV2Router.addLiquidity(this.tokenA.address, this.tokenB.address, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)

        const balances2 = await this.getBalance(this.wallet.address)
        const tokenA_balance2 = balances[0]
        const tokenB_balance2 = balances[1]

        this.setLiquidityPool(this.name, tokenA_balance2, tokenB_balance2)
    }

    async removeLiquidity() {

        const amountAMin = 1
        const amountBMin = 1
        
        const to = this.wallet.address;
        const deadline =  (await ethers.provider.getBlock("latest")).timestamp + 300

        const liquidity = await this.lpToken.callStatic.balanceOf(to)

        await this.lpToken.approve(this.uniswapV2Router.address, liquidity)

        const tx = await this.uniswapV2Router.removeLiquidity(this.tokenA.address, this.tokenB.address, liquidity, amountAMin, amountBMin, to, deadline)

        const balances = await this.getBalance(this.lpToken.address)
        const tokenA_balance = balances[0]
        const tokenB_balance = balances[1]

        this.setLiquidityPool(this.name, tokenA_balance, tokenB_balance)
    }
}

export default AgentLiquidity