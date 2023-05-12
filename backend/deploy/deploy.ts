import { ethers, hardhat } from "hardhat";
//  npx hardhat run --network testnet deploy/deploy.ts 
// npx hardhat verify --network testnet --contract contracts/token.sol:Token contract_address

async function deploy() {

  // Obtain the contract
  const Token = await ethers.getContractFactory("Token")
  // Deploy the contract
  const token = await Token.deploy()

  await token.deployed()

  // Log the deployed contract's address
  console.log("Diploma token deployed at:", token.address)
}

deploy()
  .then(() => console.log("Deployment complete"))
  .catch((error) => console.error("Error deploying contract:", error))