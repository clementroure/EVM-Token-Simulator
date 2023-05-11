import { Contract } from "ethers"
import AgentBase from "../engine/agentBase"

type MyContract = {
    name: string,
    contract: Contract
}
type MyContractFactory = {
    name: string,
    address: string,
    abi: any
}
type MyDistribution = {
    name: string,
    distribution: number[]
}
type MyAgent = {
    type: any,
    nb: number
}

type Token = {
    name: string,
    decimals: number,
    amount: number
}

export {MyContract, MyDistribution, MyContractFactory, MyAgent, Token}