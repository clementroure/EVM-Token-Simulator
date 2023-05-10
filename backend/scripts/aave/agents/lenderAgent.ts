import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import AgentBase from '../../../engine/agentBase'
import Printer from "../../../engine/printer";
import { ethers } from "hardhat";
import erc20ABI from '../../../abi/ERC20.json'

class AgentLender extends AgentBase {

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
      this.init()
    }

    async init(){
      // approve DAI
      await this.contracts!['tokenA'].approve(this.contracts!['AAVEpool'].address, ethers.utils.parseUnits('10000', 18))
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        const tokenB_balance = await this.contracts!['tokenB'].callStatic.balanceOf(to)
  
        return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
  
      if(this.id < this.distributions!['poisson'][this.getStep()]){
        if(this.distributions!['binomial'][this.getStep()] == 1)
        await this.deposit()
        else
        await this.withdraw()

        // write the result
        const balances = [(await this.contracts!['AAVEpool'].getReserveData(this.contracts!['tokenA'].address))[1], (await this.contracts!['AAVEpool'].getReserveData(this.contracts!['tokenB'].address))[1]]

        const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**6 + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, balances)
      }
    }

    async deposit() {

      const amount = ethers.utils.parseUnits(this.distributions!['normal'][this.getStep()].toString(), 18) 
      await this.contracts!['AAVEpool'].supply(this.contracts!['tokenA'].address, amount, this.wallet.address, 0)
    }

    async withdraw() {

      const amount = await this.contracts!['atoken'].callStatic.balanceOf(this.wallet.address)

      if(amount > 0)
      await this.contracts!['AAVEpool'].withdraw(this.contracts!['tokenA'].address, amount, this.wallet.address)
    }
}

export default AgentLender