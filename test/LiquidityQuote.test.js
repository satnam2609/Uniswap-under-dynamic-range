const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("LiquidityMath test contract", () => {
  async function deployContractFunction() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const LiquidityMathTest = await ethers.deployContract("LiquidityMathTest");
    await LiquidityMathTest.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { LiquidityMathTest, owner, addr1, addr2 };
  }

  describe("Deploying contract", () => {
    it("Must deployed successfully", async () => {
      (
        await loadFixture(deployContractFunction)
      ).LiquidityMathTest.getAddress();
    });
  });

  describe("Getting the Liquidity for amount0", () => {
    it("Should calculated the liquidity", async () => {
      const { LiquidityMathTest } = await loadFixture(deployContractFunction);
      console.log(
        await LiquidityMathTest.getLiquidityForAmount0(
          "5000",
          "5500",
          ethers.parseEther("1")
        )
      );
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
