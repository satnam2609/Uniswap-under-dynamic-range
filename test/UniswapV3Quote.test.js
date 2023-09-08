const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("LiquidityMath test contract", () => {
  async function deployContractFunction() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const UniswapV3QuoteTest = await ethers.deployContract(
      "UniswapV3QuoterTest"
    );
    await UniswapV3QuoteTest.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { UniswapV3QuoteTest, owner, addr1, addr2 };
  }

  describe("Deploying contract", () => {
    it("Must deployed successfully", async () => {
      (
        await loadFixture(deployContractFunction)
      ).UniswapV3QuoteTest.getAddress();
    });
  });

  describe("Getting the qouters for minting under range", () => {
    it("Should calculated the amounts", async () => {
      const { UniswapV3QuoteTest } = await loadFixture(deployContractFunction);
      console.log(await UniswapV3QuoteTest.testForMintingInRangeQouter());
    });
  });

  //   describe("Getting the Liquidity for amount1", () => {
  //     it("Should calculated the liquidity", async () => {
  //       const { LiquidityMathTest } = await loadFixture(deployContractFunction);
  //       console.log(
  //         await LiquidityMathTest.getLiquidityForAmount1(
  //           "4545",
  //           "5000",

  //           ethers.parseEther("5000")
  //         )
  //       );
  //     });
  //   });

  //   describe("Getting the Liquidity after comparing amount0 and amount1", () => {
  //     it("Should compare and get the final liquidity", async () => {
  //       const { LiquidityMathTest } = await loadFixture(deployContractFunction);
  //       console.log(
  //         await LiquidityMathTest.getLiquidityOnce(
  //           "5000",

  //           "4500",
  //           "4900",
  //           ethers.parseEther("1"),
  //           ethers.parseEther("5000")
  //         )
  //       );
  //     });
  //   });

  //   describe("Getting the amounts after calculating the liquidity", () => {
  //     it("Should compare and get the final liquidity", async () => {
  //       const { LiquidityMathTest } = await loadFixture(deployContractFunction);

  //       let liquidity = await LiquidityMathTest.getLiquidityForAmount0(
  //         "2000",
  //         "2500",
  //         ethers.parseEther("1")
  //       );

  //       console.log(
  //         await LiquidityMathTest.getCalculatedAmounts(
  //           "2000",
  //           "1500",
  //           "2500",
  //           liquidity
  //         )
  //       );
  //     });
  //   });
});
