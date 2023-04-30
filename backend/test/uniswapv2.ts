import { expect } from "chai";
import { ethers } from "hardhat";
import uniswapV2RouterABI from '../abi/UniswapV2Router.json'
import uniABI from '../abi/UNI.json'
import wethABI from '../abi/WETH.json'

describe("UniswapV2", function () {
  it("Should add liquidity", async function () {

      const wallet = await ethers.getImpersonatedSigner("0xb94F07f701304ba29A40796499c9a01E9EaD24E5");

      const tokenA = new ethers.Contract('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', uniABI, wallet);
      const tokenB = new ethers.Contract('0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', wethABI, wallet);
      const uniswapV2Router = new ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', uniswapV2RouterABI, wallet);

      await addLiquidity()

      async function getBalance(to: string) {

          const tokenA_balance = await tokenA.callStatic.balanceOf(to)
          const tokenB_balance = await tokenB.callStatic.balanceOf(to)

          console.log('UNI: ' + tokenA_balance / 10**18)
          console.log('WETH: ' + tokenB_balance / 10**18)

          return [tokenA_balance, tokenB_balance]
      }

      async function addLiquidity() {

        const balances = await getBalance(wallet.address)

        const amountADesired = 120
        const amountBDesired =1

        const amountAMin = 1
        const amountBMin = 1

        const to = wallet.address;
        const deadline = (await ethers.provider.getBlock("latest")).timestamp + 300
        
        await tokenA.approve('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', amountADesired)
        await tokenB.approve('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', amountBDesired)

        const tx = await uniswapV2Router.addLiquidity(tokenA.address, tokenB.address, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)

        const balances2 = await getBalance(wallet.address)
      }
  });
});
