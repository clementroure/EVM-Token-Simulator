import { Contract } from "ethers"
import AgentSwap from "../scripts/uniswapv2/agents/agentSwap"
import AgentLiquidity from "../scripts/uniswapv2/agents/agentLiquidity"

export type MyContract = {
    name: string,
    contract: Contract
}
export type MyContractFactory = {
    name: string,
    address: string,
    abi: any
}
export type MyDistribution = {
    name: string,
    distribution: number[]
}
export type MyAgent = {
    type: any,
    nb: number
}

export type Token = {
    name: string,
    decimals: number,
    amount: number
}


export interface PoolDeployer{
    tokenA_name: string
    tokenA_symbol: string
    tokenA_decimals : number
    tokenA_supply: number
    tokenB_name: string
    tokenB_symbol : string
    tokenB_decimals: number
    tokenB_supply: number
}

export type AgentType = typeof AgentSwap | typeof AgentLiquidity;
export interface TransformedAgent {
  type: AgentType;
  nb: number;
}