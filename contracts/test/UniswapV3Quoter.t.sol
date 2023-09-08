//SPDX-License-Identifier:UNLICENSE
pragma solidity ^0.8.14;

import "../UniswapV3Quoter.sol";
import "../UniswapV3Pool.sol";
import "../ERC20.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "../lib/TickMath.sol";

contract UniswapV3QuoterTest {
    UniswapV3Pool pool;
    ERC20 token0;
    ERC20 token1;
    UniswapV3Quoter qouter;

    struct TestCaseParams {
        uint256 lowerPrice;
        uint256 upperPrice;
        uint256 amountIn;
        bool zeroForOne;
        uint256 currentPrice;
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

    function testForMintingInRangeQouter()
        external
        returns (uint256 amount0Quote, uint256 amount1Quote)
    {
        TestCaseParams memory params = TestCaseParams({
            lowerPrice: sqrtP(4545),
            upperPrice: sqrtP(5500),
            amountIn: 0.9 ether,
            zeroForOne: true,
            currentPrice: sqrtP(5000)
        });

        (amount0Quote, amount1Quote) = setUpCase(params);
    }

    function setUpCase(
        TestCaseParams memory params
    ) internal returns (uint256 amount0Quote, uint256 amount1Quote) {
        token0 = new ERC20("ETHER", "ETH", 18, 10);
        token1 = new ERC20("USDC", "USDC", 18, 10000);
        pool = new UniswapV3Pool(
            address(token0),
            address(token1),
            sqrtP(params.currentPrice),
            tick(params.currentPrice)
        );
        qouter = new UniswapV3Quoter();
        (amount0Quote, amount1Quote) = qouter.inActiveRange(
            address(pool),
            params.lowerPrice,
            params.upperPrice,
            params.amountIn,
            params.zeroForOne
        );
    }
}
