const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("UniswapV3Pool Mint test contract", () => {
  async function deployContractFunction() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const UniswapV3PoolTest = await ethers.deployContract("UniswapV3PoolTest");
    await UniswapV3PoolTest.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { UniswapV3PoolTest, owner, addr1, addr2 };
  }

  describe("Minting the Liquidity under active price range", () => {
    it("Should calculated the liquidity", async () => {
      const { UniswapV3PoolTest } = await loadFixture(deployContractFunction);
      await UniswapV3PoolTest.testMintForSuccessUnderRange();
    });
  });

  describe("Minting the Liquidity above below price range", () => {
    it("Should calculated the liquidity", async () => {
      const { UniswapV3PoolTest } = await loadFixture(deployContractFunction);
      await UniswapV3PoolTest.testMintForRangeAbove();
    });
  });

  describe("Minting the Liquidity above active price range", () => {
    it("Should calculated the liquidity", async () => {
      const { UniswapV3PoolTest } = await loadFixture(deployContractFunction);
      await UniswapV3PoolTest.testMintForRangeBelow();
    });
  });
});
