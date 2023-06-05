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

      await this.printKeyMetrics()
      
      await this.deposit()
      
      await this.printKeyMetrics()
      
      await this.borrow()
      await this.printKeyMetrics()

      await this.repay()
      await this.printKeyMetrics()

      await this.withdraw()
      await this.printKeyMetrics()

      const priceDAI = await this.contracts!['AAVEOracle'].getAssetPrice('0x5bB220Afc6E2e008CB2302a83536A019ED245AA2')
      console.log('Oracle price : $' + priceDAI/10**8)
    }

    async takeStep() {

      // if(this.id < this.distributions!['poisson'][this.getStep()]){
      //   if(this.distributions!['binomial'][this.getStep()] == 1)
      //   await this.deposit()
      //   else
      //   await this.borrow()
          
      //   // print key metrics
      //   await this.printKeyMetrics()
      // }
    }

    async deposit() {
      const depositAmount = ethers.utils.parseEther('150'); 
      if(this.contracts!['tokenA'].balanceOf(this.wallet.address) > depositAmount){
        const depositTx = await this.contracts!['AAVEpool'].deposit(this.contracts!['tokenA'].address, depositAmount, this.wallet.address, 0)
        await depositTx.wait()
      }
      else{
        console.log('Deposit reverted : insufficient balance')
      }
    }

    async borrow() {
      const amount = 75
      const userAccountData = await this.contracts!['AAVEpool'].getUserAccountData(this.wallet.address)

      if(parseFloat(await this.getBorrowBalance()) + amount < parseFloat(await this.getCollateralBalance()) * (userAccountData.ltv/10**4) ){

        const borrowAmount = ethers.utils.parseEther(amount.toString())
        const borrowTx = await this.contracts!['AAVEpool'].borrow(this.contracts!['tokenA'].address, borrowAmount, 2, 0, this.wallet.address)
        await borrowTx.wait()
      }
      else{
        console.log('Borrow reverted : Not enough collateral')
      }
    }

    async repay() {
      const repayAmount = ethers.utils.parseEther((await this.getBorrowBalance()).toString())
      if(repayAmount.gt(ethers.utils.parseEther('0'))){
        const repayTx = await await this.contracts!['AAVEpool'].repay(this.contracts!['tokenA'].address, repayAmount, 2,this. wallet.address);
        await repayTx.wait();
      }
      else{
        console.log('Repay reverted : Borrow amount is close to 0')
      }
    }

    async withdraw() {
      const _withdrawAmount = ethers.utils.parseEther(((await this.getCollateralBalance())).toString())
      const withdrawAmount = _withdrawAmount.div(4)
      if(withdrawAmount.gt(ethers.utils.parseEther('0'))){

        const withdrawTx = await await this.contracts!['AAVEpool'].withdraw(this.contracts!['tokenA'].address, withdrawAmount, this.wallet.address);
        await withdrawTx.wait()
      }
      else{
        console.log('Withdraw reverted : nothing to withdraw')
      }
    }

    async printKeyMetrics() {
      console.log()
      // Fetch user account data
      const userAccountData = await this.contracts!['AAVEpool'].getUserAccountData(this.wallet.address);
      console.log("Health Factor: ", (userAccountData.healthFactor / 10**18).toString());
      console.log("Liquidation Threshold: ", userAccountData.currentLiquidationThreshold.toString());
      console.log("Collateralization Ratio: ", userAccountData.ltv.toString());

      console.log(await this.getCollateralBalance())
      console.log(await this.getBorrowBalance())
      
      console.log()
  }

  // Collateral Balance: The total amount of assets a user has deposited as collateral.
  async getCollateralBalance() {
    const collateral = await this.contracts!['atoken'].balanceOf(this.wallet.address);
    return ethers.utils.formatUnits(collateral, 18);
  }

  // Borrow Balance: The total amount of assets a user has borrowed.
  async getBorrowBalance() {
    const stableDebt = await this.contracts!['stableDebtToken'].balanceOf(this.wallet.address);
    const variableDebt = await this.contracts!['variableDebtToken'].balanceOf(this.wallet.address);
    return ethers.utils.formatUnits(stableDebt.add(variableDebt), 18);
  }

  // https://docs.aave.com/risk/v/master/asset-risk/risk-parameters

  // Liquidation treshold -> 80.00% if ratio reached this, user's position can be liquidated
  // collateralization ratio: max % ratio user can borrow from deposited amount
  // health factor = sum(atoken * liquidation treshold) / sum(stable debt + variable debt)

  // when hf < 1, loan is undercollateralised and may be liquidated

  // Oracle prix AAVE
  // Black scholes to modify oracle prices
}

export default AgentBorrower