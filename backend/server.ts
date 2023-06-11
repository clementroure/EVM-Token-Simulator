// REST API - Called by the frontend to generate the simulation
import express from "express";
import cors from 'cors'
import * as dotenv from "dotenv";
import main from './scripts/uniswapv2/netlist'
dotenv.config();
const app = express();

// Middleware for parsing JSON
app.use(express.json())
// CORS Policy
app.use(cors())


app.get('/aave', async (req, res) => {
  try {
    await main()
    res.status(200).send("Main function executed successfully")
  } catch (err) {
    console.error(err)
    res.status(500).send("There was an error executing the main function")
  }
})


const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`App is listening to port ${port}`)
})