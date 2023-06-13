import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract } from "ethers"
import Printer from "./printer"

abstract class AgentBase {
    readonly name: String
    readonly id: number
    readonly parentPort: MessagePort | null
    readonly wallet: SignerWithAddress
    readonly printer: Printer | undefined = undefined
    readonly getStep: Function
    readonly setTrackedResults: Function
    // optional params
    distributions?: { [key: string]: number[] } = {}
    contracts?: { [key: string]: Contract } = {}

    constructor(
        name: String, parentPort: MessagePort | null, wallet: SignerWithAddress,  printer: Printer, getStep: Function, setTrackedResults: Function,
        distributions?: { [key: string]: number[] }, contracts?: { [key: string]: Contract },
    ){
        this.name = name
        this.id = parseInt(name.slice(-1))
        this.parentPort = parentPort
        this.wallet = wallet
        this.printer = printer
        this.getStep = getStep
        this.setTrackedResults = setTrackedResults
        // optional
        this.distributions = distributions
        this.contracts = contracts
     }
    
    abstract init(): Promise<void>

    abstract takeStep(action?: any): Promise<void>
}

export default AgentBase
