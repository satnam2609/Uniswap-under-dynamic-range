// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.14;

import "./interfaces/IUniswapV3Pool.sol";
import "./lib/TickMath.sol";
import "./lib/LiquidityMath.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";

contract UniswapV3Quoter {
    struct QuoteParams {
        address pool;
        uint256 amountIn;
        uint160 sqrtPriceLimitX96;
        bool zeroForOne;
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

    function inActiveRange(
        address pool,
        uint256 lowerPrice,
        uint256 upperPrice,
        uint256 amountIn,
        bool zeroForOne
    ) public returns (uint256 amount0Quote, uint256 amount1Quote) {
        (uint160 currentPrice, ) = IUniswapV3Pool(pool).slot0();
        uint128 amount = zeroForOne
            ? LiquidityMath.getLiquidityForAmount0(
                sqrtP(currentPrice),
                sqrtP(upperPrice),
                amountIn
            )
            : LiquidityMath.getLiquidityForAmount1(
                sqrtP(currentPrice),
                sqrtP(lowerPrice),
                amountIn
            );
        try
            IUniswapV3Pool(pool).mint(
                address(this),
                tick(lowerPrice),
                tick(upperPrice),
                amount,
                abi.encode(pool)
            )
        {} catch (bytes memory reason) {
            return abi.decode(reason, (uint256, uint256));
        }
    }

    function quote(
        QuoteParams memory params
    )
        public
        returns (uint256 amountOut, uint160 sqrtPriceX96After, int24 tickAfter)
    {
        try
            IUniswapV3Pool(params.pool).swap(
                address(this),
                params.zeroForOne,
                params.amountIn,
                params.sqrtPriceLimitX96 == 0
                    ? (
                        params.zeroForOne
                            ? TickMath.MIN_SQRT_RATIO + 1
                            : TickMath.MAX_SQRT_RATIO - 1
                    )
                    : params.sqrtPriceLimitX96,
                abi.encode(params.pool)
            )
        {} catch (bytes memory reason) {
            return abi.decode(reason, (uint256, uint160, int24));
        }
    }

    // function quoteLiquidity(MintParams  memory params) public returns(uint256 amount0,amount1){

    // }

    function uniswapV3MintCallback(
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external pure {
        require(abi.decode(data, (address)) != address(0));

        uint256 amount0Quote = amount0;

        uint256 amount1Quote = amount1;

        assembly {
            let ptr := mload(0x40)
            mstore(ptr, amount0Quote)
            mstore(ptr, amount1Quote)
            revert(ptr, 96)
        }
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes memory data
    ) external view {
        address pool = abi.decode(data, (address));

        uint256 amountOut = amount0Delta > 0
            ? uint256(-amount1Delta)
            : uint256(-amount0Delta);

        (uint160 sqrtPriceX96After, int24 tickAfter) = IUniswapV3Pool(pool)
            .slot0();

        assembly {
            let ptr := mload(0x40)
            mstore(ptr, amountOut)
            mstore(add(ptr, 0x20), sqrtPriceX96After)
            mstore(add(ptr, 0x40), tickAfter)
            revert(ptr, 96)
        }
    }
}
