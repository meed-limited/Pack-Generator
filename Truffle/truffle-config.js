require("dotenv").config({ path: "../.env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = require("./secret.json").mnemonic;

// Nodes connection:
const API_KEY_ETH = process.env.REACT_APP_MORALIS_SPEEDY_NODES_KEY_ETH;
const API_KEY_BSC = process.env.REACT_APP_MORALIS_SPEEDY_NODES_KEY_BSC;
const API_KEY_POLYGON = process.env.REACT_APP_MORALIS_SPEEDY_NODES_KEY_POLYGON;
const API_KEY_BSC_TESTNET = process.env.REACT_APP_MORALIS_SPEEDY_NODES_KEY_BSC_TESTNET;
const API_KEY_POLYGON_TESTNET = process.env.REACT_APP_MORALIS_SPEEDY_NODES_KEY_POLYGON_TESTNET;

// Explorer API to verify contract
const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
const BSCSCAN_API_KEY = process.env.REACT_APP_BSCSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.REACT_APP_POLYGONSCAN_API_KEY;

module.exports = {
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: ETHERSCAN_API_KEY,
    polygonscan: POLYGONSCAN_API_KEY,
    bscscan: BSCSCAN_API_KEY,
  },
  networks: {
    // development: {
    //   host: "127.0.0.1",
    //   port: 7545,
    //   chainId: 1337,
    //   network_id: 1337,
    // },
    ethereum_mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `${API_KEY_ETH}`),
      network_id: 1,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    bsc_testnet: {
      provider: () => new HDWalletProvider(mnemonic, `${API_KEY_BSC_TESTNET}`),
      network_id: 97,
      // confirmations: 2
    },
    bsc_mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `${API_KEY_BSC}`),
      network_id: 56,
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    polygon_mumbai: {
      provider: () => new HDWalletProvider(mnemonic, `${API_KEY_POLYGON_TESTNET}`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    polygon_mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `${API_KEY_POLYGON}`),
      network_id: 137,
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.13", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 150,
        },
        // evmVersion: "byzantium"
      },
    },
  },
};
