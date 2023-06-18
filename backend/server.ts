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

const workerMap = new Map();

wss.on('connection', ws => {
  console.log('New WebSocket connection established');
  
  let connectMsg = { status: 'info', value: 'Connected to the server' };
  ws.send(JSON.stringify(connectMsg));

  ws.on('message', async message => {
    console.log(`Received: ${message}`);

    let params;
    try {
      params = JSON.parse(message as string);
    } catch (err) {
      console.log('Error parsing JSON', err);
      return;
    }

    if (params.command == 'uniswap_v2') {
      const worker = new Worker('./main-worker.js');
      workerMap.set(ws, worker);  // associate the worker with the websocket

      worker.on('message', (result) => {
        let msg;
        if (result.status === 'success') {
          msg = { status: 'success', value: result.value };
          ws.send(JSON.stringify(msg));
        } 
        else if(result.status == 'update') {
          msg = { status: 'update', value: result.value };
          ws.send(JSON.stringify(msg));
        }
        else {
          console.error(result.error);
          msg = { status: 'error', value: "There was an error executing the main function" };
          ws.send(JSON.stringify(msg));
        }
      });

      worker.on('error', (err) => {
        console.error(err);
        ws.send("There was an error with the worker thread");
      });

      worker.postMessage(params);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    console.log('CLOSE 1')
    if (workerMap.has(ws)) {
      console.log('CLOSE 2')
      const worker = workerMap.get(ws);
      worker.postMessage({command: 'stop'});
      workerMap.delete(ws);
    }
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`App is listening to port ${port}`)
});
