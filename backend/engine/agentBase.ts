import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract } from "ethers"
import {MyContract, MyDistribution} from './types'
import Printer from "./printer"

abstract class AgentBase {
    readonly name: String
    readonly id: number
    readonly wallet: SignerWithAddress
    readonly printer: Printer | undefined = undefined
    readonly getStep: Function
    readonly setTrackedResults: Function
    // optional params
    distributions?: { [key: string]: number[] } = {}
    contracts?: { [key: string]: Contract } = {}

    constructor(
        name: String, wallet: SignerWithAddress,  printer: Printer, getStep: Function, setTrackedResults: Function,
        distributions?: MyDistribution[], contracts?: MyContract[],
    ){
        this.name = name
        this.id = parseInt(name.slice(-1))
        this.wallet = wallet
        this.printer = printer
        this.getStep = getStep,
        this.setTrackedResults = setTrackedResults
        // optional
        for (let i = 0; i < distributions!.length; i++)
            this.distributions![`${distributions![i].name}`] = distributions![i].distribution
        for (let i = 0; i < contracts!.length; i++) 
            this.contracts![`${contracts![i].name}`] = contracts![i].contract.connect(wallet)
    }
    
    abstract init(): Promise<void>

    abstract takeStep(): Promise<void>
}

export default AgentBase
