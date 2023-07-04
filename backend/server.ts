import express from "express";
import http from 'http';
import cors from 'cors'
import * as dotenv from "dotenv";
import { Worker } from 'worker_threads';
import { Server } from 'ws';
import WebSocket from 'ws';

dotenv.config();
const app = express();

// Middleware for parsing JSON
app.use(express.json())
// CORS Policy
app.use(cors())

const server = http.createServer(app);
const wss = new Server({ server });

const workerMap = new Map();
const wsConnections: WebSocket[] = [];

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection established');
  
  wsConnections.push(ws);

  let connectMsg = { status: 'info', value: 'Connected to the server' };
  ws.send(JSON.stringify(connectMsg));

  ws.on('message', async message => {
    console.log(`Received: ${message}`);

    let params;
    try {
      params = JSON.parse((message as unknown) as string);
    } catch (err) {
      console.log('Error parsing JSON', err);
      return;
    }

    if (params.command == 'uniswap_v2') {
      const worker = new Worker('./main-worker.js');
      workerMap.set(ws, worker);

      worker.on('message', (result) => {
        const msg = { status: result.status, value: result.value };
        ws.send(JSON.stringify(msg));
      });

      worker.on('error', (err) => {
        console.error(err);
        ws.send("There was an error with the worker thread");
      });

      worker.postMessage(params);
    }
    else if(params.command == 'isolate') {
      // same worker as uniswap_v2
      const worker = workerMap.get(ws);
      worker.postMessage({command: 'isolate', code: params.code});
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    const worker = workerMap.get(ws);
    worker.postMessage({command: 'stop'});
    workerMap.delete(ws);

    const index = wsConnections.indexOf(ws);
    if (index > -1) {
      wsConnections.splice(index, 1);
    }
  });
});

process.on('uncaughtException', function (err) {
  console.error(err);

  wsConnections.forEach((ws) => {
    ws.close();
  });

  server.close(() => {
    console.log('Server closed due to an uncaught exception');
  });
});


const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`App is listening to port ${port}`)
});
