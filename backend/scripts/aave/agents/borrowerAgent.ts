import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import AgentBase from '../../../engine/agentBase'
import Printer from "../../../engine/printer";
import { ethers } from "hardhat";

class AgentBorrower extends AgentBase {

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
      // approve USDC
      await this.contracts!['tokenB'].approve(this.contracts!['AAVEpool'].address, ethers.utils.parseUnits('10000', 18))
    }

    async takeStep() {

      if(this.id < this.distributions!['poisson'][this.getStep()]){
        if(this.distributions!['binomial'][this.getStep()] == 1)
        await this.deposit()
        else
        await this.repay()

        // write the result
        const balances = [(await this.contracts!['AAVEpool'].getReserveData(this.contracts!['tokenA'].address))[1], (await this.contracts!['AAVEpool'].getReserveData(this.contracts!['tokenB'].address))[1]]

        const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**6 + '\n'
        this.printer!.printTxt(txt)
  
        this.setTrackedResults(this.name, balances)
      }
    }

    async borrow() {

      const amount = ethers.utils.parseUnits((this.distributions!['normal'][this.getStep()]).toFixed(6).toString(), 6)
      await this.contracts!['AAVEpool'].borrow(this.contracts!['tokenB'].address, amount, 2, 0, this.wallet.address)
    }

    async repay() {

      const amount1 = await this.contracts!['stableDebtToken'].callStatic.balanceOf(this.wallet.address)
      const amount2 = await this.contracts!['variableDebtToken'].callStatic.balanceOf(this.wallet.address)
      console.log(amount1, amount2)

      if(amount2>0)
      await  this.contracts!['AAVEpool'].repay(this.contracts!['tokenB'].address, amount2, 2, this.wallet.address)
    }

    /// have to deposit first to borrow
    async deposit() {

      const amount = ethers.utils.parseUnits((this.distributions!['normal'][this.getStep()]*10).toString(), 18) 
      await this.contracts!['AAVEpool'].supply(this.contracts!['tokenA'].address, amount, this.wallet.address, 0)

      await this.borrow()
    }
}

export default AgentBorrower