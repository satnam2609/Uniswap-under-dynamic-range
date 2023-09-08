//SPDX-License-Identifier:UNLICENSE
pragma solidity ^0.8.14;

import "../lib/LiquidityMath.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "../lib/TickMath.sol";
import "../lib/Math.sol";

contract LiquidityMathTest {
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

    function getLiquidityForAmount0(
        uint256 CurrentPrice,
        uint256 UpperPrice,
        uint256 amount0
    ) external pure returns (uint128 result) {
        uint160 sqrtPriceAX96 = sqrtP(CurrentPrice);
        uint160 sqrtPriceBX96 = sqrtP(UpperPrice);
        result = LiquidityMath.getLiquidityForAmount0(
            sqrtPriceAX96,
            sqrtPriceBX96,
            amount0
        );
    }

    function getLiquidityForAmount1(
        uint256 CurrentPrice,
        uint256 LowerPrice,
        uint256 amount1
    ) external pure returns (uint128 result) {
        uint160 sqrtPriceAX96 = sqrtP(CurrentPrice);
        uint160 sqrtPriceBX96 = sqrtP(LowerPrice);

        result = LiquidityMath.getLiquidityForAmount1(
            sqrtPriceAX96,
            sqrtPriceBX96,
            amount1
        );
    }

    function getLiquidityOnce(
        uint256 CurrentPrice,
        uint256 LowerPrice,
        uint256 UpperPrice,
        uint256 amount0,
        uint256 amount1
    ) external pure returns (uint128 result) {
        uint160 sqrtPriceX96 = sqrtP(CurrentPrice);
        uint160 sqrtPriceAX96 = sqrtP(LowerPrice);
        uint160 sqrtPriceBX96 = sqrtP(UpperPrice);
        result = LiquidityMath.getLiquidityForAmounts(
            sqrtPriceX96,
            sqrtPriceAX96,
            sqrtPriceBX96,
            amount0,
            amount1
        );
    }

    function getCalculatedAmounts(
        uint256 CurrentPrice,
        uint256 LowerPrice,
        uint256 UpperPrice,
        uint128 liquidity
    ) external pure returns (uint256 amount0, uint256 amount1) {
        amount0 = Math.calcAmount0Delta(
            sqrtP(CurrentPrice),
            sqrtP(UpperPrice),
            liquidity
        );

        amount1 = Math.calcAmount1Delta(
            sqrtP(CurrentPrice),
            sqrtP(LowerPrice),
            liquidity
        );
    }
}
