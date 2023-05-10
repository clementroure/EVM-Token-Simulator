// REST API - Called by the frontend to generate the simulation
import express from "express";
import * as dotenv from "dotenv";
import main from './scripts/uniswapv2/netlist'
import { execSync, spawn } from "child_process";
import path from 'path';
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

app.get('/uniswapv2', (req, res) => {
  main()
});


app.listen(4000, () => {
  console.log("App is listening to port 4000")
});