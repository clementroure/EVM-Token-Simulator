const path = require("path");
const { parentPort } = require("worker_threads");

const project = path.resolve(__dirname, "./tsconfig.json");
require("ts-node").register({
    project,
    transpileOnly: true,
});
try {
    const worker = require(path.resolve(__dirname, './scripts/uniswapv2/netlist.ts'));

    worker.default({
        parentPort,
    });
} catch (e) {
    console.error(e);
}
