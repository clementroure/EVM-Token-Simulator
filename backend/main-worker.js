const path = require("path");
const { parentPort, workerData } = require("worker_threads");

parentPort.on("message", (data) => {
  const { contracts, tokens, agents } = data;

  const project = path.resolve(__dirname, "./tsconfig.json");
  require("ts-node").register({
      project,
      transpileOnly: true,
  });
  try {
      const worker = require(path.resolve(__dirname, './scripts/uniswapv2/netlist.ts'));

      worker.default({
          parentPort,
          contracts,
          tokens,
          agents
      });
  } catch (e) {
      console.error(e);
  }
});