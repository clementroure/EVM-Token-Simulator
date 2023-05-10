import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import AgentBase from '../../../engine/agentBase'
import Printer from "../../../engine/printer";

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
      await this.contracts!['tokenA'].approve(this.contracts!['AAVEpool'].address, Number.MAX_SAFE_INTEGER-1)
    }

    async getBalance(to: string) {

        const tokenA_balance = await this.contracts!['tokenA'].callStatic.balanceOf(to)
        const tokenB_balance = await this.contracts!['tokenB'].callStatic.balanceOf(to)
  
        // console.log('UNI: ' + tokenA_balance / 10**18)
        // console.log('WETH: ' + tokenB_balance / 10**18)
  
        return [tokenA_balance, tokenB_balance]
    }
  
    async takeStep() {
      if(this.id < this.distributions!['poisson'][this.getStep()]){
        if(this.distributions!['binomial'][this.getStep()] == 1)
        await this.deposit()
        else
        await this.withdraw()
      }
    }

    async deposit() {

      const c = 0.00001*10**18
      const amount = c * this.distributions!['normal'][this.getStep()]

      const tx = await  this.contracts!['AAVEpool'].supply(this.contracts!['tokenA'].address, amount, this.wallet.address, 0)

      const balances = await this.getBalance(this.contracts!['AAVEpool'].address)

      const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**6 + '\n'
      this.printer!.printTxt(txt)

      this.setTrackedResults(this.name, balances)
    }

    async withdraw() {

        let balances = await this.getBalance(this.contracts!['AAVEpool'].address)
        const amount = balances[0] / 2

        const tx = await  this.contracts!['AAVEpool'].withdraw(this.contracts!['tokenA'].address, amount, this.wallet.address)

        balances = await this.getBalance(this.contracts!['AAVEpool'].address)

        const txt =  (this.getStep()+1) + ': ' + this.name + ' -> amountA: ' +  balances[0]/10**18 + ' amountB: ' + balances[1]/10**6 + '\n'
        this.printer!.printTxt(txt)

        this.setTrackedResults(this.name, balances)
    }
}

export default AgentLender