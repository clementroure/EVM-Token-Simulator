import { Contract } from "ethers"

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