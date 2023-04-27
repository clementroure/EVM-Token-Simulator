import express from "express";
import https from 'https';
import * as dotenv from "dotenv";
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

app.get('/test',(req,res) => {
 
  console.log(req);
});

///

app.listen(4000, () => {
  console.log("App is listening to port 4000")
});