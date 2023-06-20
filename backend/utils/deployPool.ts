import { ethers } from "hardhat";
import * as abi from '../constants/abi'
import * as address from '../constants/address'
import { PoolDeployer } from '../utils/types'

const hre = require('hardhat');

export default async function deployPool(poolDeployer: PoolDeployer): Promise<any> {

    const [deployer] = await ethers.getSigners();
    // console.log(await deployer.getBalance())
    // console.log("Deploying contracts with the account:", deployer.address);
    
    const TokenA = await hre.ethers.getContractFactory("Token");
    const tokenADecimals = poolDeployer.tokenA_decimals
    const tokenA = await TokenA.deploy(poolDeployer.tokenA_name, poolDeployer.tokenA_symbol, poolDeployer.tokenA_decimals, {
        gasLimit: 1000000
    }); 
    await tokenA.deployed();

    const TokenB = await hre.ethers.getContractFactory("Token");
    const tokenBDecimals = poolDeployer.tokenB_decimals
    const tokenB = await TokenB.deploy(poolDeployer.tokenB_name, poolDeployer.tokenB_symbol, poolDeployer.tokenB_decimals, {
        gasLimit: 1000000
    }); 
    await tokenB.deployed();

    // console.log('Token A address:', tokenA.address);
    // console.log('Token B address:', tokenB.address);

    // Use a previously deployed Uniswap V2 Factory
    const uniswapFactory = new ethers.Contract(address.UNISWAP_V2_FACTORY, abi.UNISWAP_V2_FACTORY, deployer);
    // console.log('Uniswap V2 Factory address:', uniswapFactory.address);

    // Create a new pair using the previously deployed factory
    await uniswapFactory.createPair(tokenA.address, tokenB.address);

    const pairAddress = await uniswapFactory.getPair(tokenA.address, tokenB.address);

    // Instance of the Uniswap Router contract
    const uniswapRouter = new ethers.Contract(address.UNISWAP_V2_ROUTER, abi.UNISWAP_V2_ROUTER, deployer);

    // Approve Uniswap Router to spend tokens
    await tokenA.approve(uniswapRouter.address, ethers.utils.parseUnits(poolDeployer.tokenA_supply.toString(), tokenADecimals));
    await tokenB.approve(uniswapRouter.address, ethers.utils.parseUnits(poolDeployer.tokenB_supply.toString(), tokenBDecimals));

    // Add initial liquidity
    await uniswapRouter.addLiquidity(
        tokenA.address, // address of the first token
        tokenB.address, // address of the second token
        ethers.utils.parseUnits(poolDeployer.tokenA_supply.toString(), tokenADecimals),  // amount of the first token
        ethers.utils.parseUnits(poolDeployer.tokenB_supply.toString(), tokenBDecimals),  // amount of the second token
        ethers.utils.parseUnits(poolDeployer.tokenA_supply.toString(), tokenADecimals),  // min amount of the first token
        ethers.utils.parseUnits(poolDeployer.tokenB_supply.toString(), tokenBDecimals),  // min amount of the second token
        deployer.address,  // recipient address, receiving any leftover tokens
        Math.floor(Date.now() / 1000) + 60 * 10  // deadline
    );

    console.log('Uniswap V2 Pair address:', pairAddress);

    const pool = {
        address: pairAddress,
        tokenA: tokenA.address,
        tokenB: tokenB.address
    }

    return pool
}
