---
sidebar_position: 1
---

# Getting Started

Let's see how to setup **TokenSimulatorPRO** on EVM.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.
  - The project has been tested with Node v16.19.0. By using a different version, you might encounter runtime errors.

To switch Node version, run the command bellow (in cmd with admin privileges) :
```bash
nvm use v16.19.0
```
- A Goerli RPC url

Create a new Ethereum Goerli app on [Alchemy](https://dashboard.alchemy.com/) and get the API Key.
```bash
https://eth-goerli.g.alchemy.com/v2/{API_KEY}
```
- A Sepolia RPC url

Create a new Ethereum Sepolia app on [Alchemy](https://dashboard.alchemy.com/) and get the API Key.
```bash
https://eth-sepolia.g.alchemy.com/v2/{API_KEY}
```

- The official TokenSimulatorPRO library :
```bash
git clone https://gitlab.com/pyratzlabs/software/defi/etudes/agent-based-simulator
```

Rename `.env.example` to `.env` and add our test wallet address.

```js title=".env"
GOD_WALLET_ADDRESS=0xb94F07f701304ba29A40796499c9a01E9EaD24E5
```

You can use your own [MetaMask](https://metamask.io/) wallet but it has to contains, at least :
  - UNI (0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984)
  - WETH (0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6)
  - DAI (0xBa8DCeD3512925e52FE67b1b5329187589072A55)
  - USDC (0x65aFADD39029741B3b8f0756952C74678c9cEC93)

## Test UniswapV2

In this first example, we will track the amount of UNI and WETH in a liquidity pool.

Because the Uniswap contracts are not deployed on the Sepolia testnet, we will have to use the Goerli testnet.

```js title=".env"
ALCHEMY_URL=https://eth-goerli.g.alchemy.com/v2/{API_KEY}
```

Run the default UniswapV2 scenario :

```bash
cd backend
npm install
npx hardhat run scripts/uniswapv2/netlist
```