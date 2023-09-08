//SPDX-License-Identifier:UNLICENSE
pragma solidity ^0.8.14;

import "../UniswapV3Pool.sol";
import "../ERC20.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "../lib/TickMath.sol";
import "../interfaces/IUniswapV3Pool.sol";
import "hardhat/console.sol";

contract UniswapV3PoolTest {
    UniswapV3Pool pool;
    ERC20 token0;
    ERC20 token1;

    struct TestCaseParasms {
        uint160 sqrtPriceX96;
        int24 lowerTick;
        int24 upperTick;
        int24 currentTick;
        uint128 liquidity;
        uint256 wethBalance;
        uint256 usdcBalance;
    }

    function testMintForSuccessUnderRange()
        external
        returns (uint256 amount0, uint256 amount1)
    {
        TestCaseParasms memory params = TestCaseParasms({
            sqrtPriceX96: sqrtP(5000),
            lowerTick: tick(4545),
            upperTick: tick(5500),
            currentTick: tick(5000),
            liquidity: 1518129116516325614066,
            wethBalance: 1 ether,
            usdcBalance: 5000 ether
        });

        (amount0, amount1) = setUpCase(params);

        // assert(amount0 == 0.788213344597459363 ether); if 1 and
        // assert(amount1 == 1999.999999999999999998 ether);
    }

    function testMintForRangeAbove()
        external
        returns (uint256 amount0, uint256 amount1)
    {
        TestCaseParasms memory params = TestCaseParasms({
            sqrtPriceX96: sqrtP(5000),
            lowerTick: tick(5001),
            upperTick: tick(5500),
            currentTick: tick(5000),
            liquidity: 1522928143956902230833,
            wethBalance: 1 ether,
            usdcBalance: 5000 ether
        });

        (amount0, amount1) = setUpCase(params);
    }

    function testMintForRangeBelow()
        external
        returns (uint256 amount0, uint256 amount1)
    {
        TestCaseParasms memory params = TestCaseParasms({
            sqrtPriceX96: sqrtP(5000),
            lowerTick: tick(4500),
            upperTick: tick(4900),
            currentTick: tick(5000),
            liquidity: 1712791825472824151838,
            wethBalance: 1 ether,
            usdcBalance: 5000 ether
        });

        (amount0, amount1) = setUpCase(params);
    }

    function tick(uint256 price) internal pure returns (int24 tick_) {
        tick_ = TickMath.getTickAtSqrtRatio(
            uint160(
                int160(
                    ABDKMath64x64.sqrt(int128(int256(price << 64))) <<
                        (FixedPoint96.RESOLUTION - 64)
                )
            )
        );
    }

    function sqrtP(uint256 price) internal pure returns (uint160) {
        return TickMath.getSqrtRatioAtTick(tick(price));
    }

    function uniswapV3MintCallback(
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) public {
        IUniswapV3Pool.CallbackData memory extra = abi.decode(
            data,
            (IUniswapV3Pool.CallbackData)
        );

        ERC20(extra.token0).transferFrom(extra.payer, msg.sender, amount0);
        ERC20(extra.token1).transferFrom(extra.payer, msg.sender, amount1);
    }

    function setUpCase(
        TestCaseParasms memory params
    ) internal returns (uint256 amount0, uint256 amount1) {
        token0 = new ERC20("COSMOS", "COSMOS", 18, 10);
        token1 = new ERC20("DAI", "DAI", 18, 100000);

        pool = new UniswapV3Pool(
            address(token0),
            address(token1),
            params.sqrtPriceX96,
            params.currentTick
        );

        token0.approve(address(this), params.wethBalance);
        token1.approve(address(this), params.usdcBalance);

        (amount0, amount1) = pool.mint(
            address(this),
            params.lowerTick,
            params.upperTick,
            params.liquidity,
            abi.encode(
                IUniswapV3Pool.CallbackData({
                    token0: address(token0),
                    token1: address(token1),
                    payer: address(this)
                })
            )
        );
    }
}
