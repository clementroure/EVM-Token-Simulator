import express from "express";
import { Server } from 'ws';
import http from 'http';
import cors from 'cors'
import * as dotenv from "dotenv";
import { Worker } from 'worker_threads';

dotenv.config();
const app = express();

// Middleware for parsing JSON
app.use(express.json())
// CORS Policy
app.use(cors())

const server = http.createServer(app);
const wss = new Server({ server });

wss.on('connection', ws => {
  ws.on('message', async message => {
    console.log(`Received: ${message}`);

    let params;
    try {
      params = JSON.parse(message as string);
    } catch (err) {
      console.log('Error parsing JSON', err);
      return;
    }

    if (params.command == 'aave') {
      const worker = new Worker('./main-worker.js');

      worker.on('message', (result) => {
        if (result.status === 'success') {
          ws.send("Main function executed successfully");
        } else {
          console.error(result.error);
          ws.send("There was an error executing the main function");
        }
      });

      worker.on('error', (err) => {
        console.error(err);
        ws.send("There was an error with the worker thread");
      });

      worker.postMessage(params);
    }
  });

  ws.send('Connected to the server');
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`App is listening to port ${port}`)
});
