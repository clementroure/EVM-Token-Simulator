import { Contract } from "ethers"
import AgentBase from "./agentBase"

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
    type: AgentBase,
    nb: number
}

export {MyContract, MyDistribution, MyContractFactory, MyAgent}