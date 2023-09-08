require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/U8CWxcf22W0e86JMl4rqHfAdeMiIovpJ`,
      accounts: [
        `0xd38e2e81a942d82597e76703a0f3084084f322e7ab04156a10019cd6e3819112`,
        "0x0efe55b80cd64dacd1dd2d69a58076d4d4f552f3e7227cd23d5d68aa9384dbda",
      ],
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
  },
};
