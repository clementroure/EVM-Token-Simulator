// REST API - Called by the frontend to generate the simulation
import express from "express";
import * as dotenv from "dotenv";
import main from './scripts/uniswapv2/netlist'
import { execSync } from "child_process";
dotenv.config();
const app = express();

// CORS Policy
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Credentials', '*');
  next();
});

/// GET
app.get('/',(req,res) => {
 
  // res.json({"foo": "bar"});
  res.send('EVM agent-based token simulator - REST API')
});

app.get('/uniswapv2',(req,res) => {
 
  // const output = execSync('npx hardhat run ./scripts/uniswapv2/netlist.ts', { encoding: 'utf-8' });
  // console.log(output)
  main()
    .then(() => {
      console.log("UniswapV2 simulation completed !"); 
      res.send('UniswapV2 simulation completed !')}
    )
    .catch((error) => {
      console.error("ERROR : UniswapV2 simulation crashed.", error)
      res.send('ERROR : UniswapV2 simulation crashed.')}
    )
});


app.listen(4000, () => {
  console.log("App is listening to port 4000")
});