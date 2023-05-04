 An updated Typescript + Hardhat version of TokenSpice (https://github.com/tokenspice/tokenspice)
 
 Usage

 This project has been tested with node v16.19.0

 - nvm use v16.19.0 (in cmd with administrator privileges)


 BACKEND

 - cd backend
 - npm install
 - rename .env.example to .env and add the variables

 ⚠️ To run the examples, your variables must be : 
 1) your Alchemy Goerli rpc url
 2) the address of a wallet on Goerli that contains :
 - UNI (0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984)
 - WETH (0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6)
 - DAI (0x68194a729C2450ad26072b3D33ADaCbcef39D574)
 - USDC (0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f)

 Run the examples with

 - npx hardhat run scripts/uniswapv2/netlist.ts
 - npx hardhat run scripts/uniswapv3/netlist.ts
 - npx hardhat run scripts/aave/netlist.ts

 FRONTEND

 - cd frontend
 - yarn install
 - yarn run dev

 Select the .csv generated by the backend to generate a graph

