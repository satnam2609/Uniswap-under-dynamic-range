// import "./LiquidityForm.css";
import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { uint256Max } from "../lib/constants";
import { MetaMaskContext } from "../contexts/MetaMask";
import { TickMath, encodeSqrtRatioX96 } from "@uniswap/v3-sdk";
import config from "../config.js";
import debounce from "../lib/debounce";

const slippage = 0.5;

const formatAmount = ethers.utils.formatUnits;

const priceToSqrtP = (price) => encodeSqrtRatioX96(price, 1);

const priceToTick = (price) => TickMath.getTickAtSqrtRatio(priceToSqrtP(price));

const addLiquidity = (
  account,
  lowerPrice,
  upperPrice,
  amount0,
  amount1,
  { token0, token1, manager, poolInterface }
) => {
  if (!token0 || !token1) {
    return;
  }

  const amount0Desired = ethers.utils.parseEther(amount0);
  const amount1Desired = ethers.utils.parseEther(amount1);

  const amount0Min = amount0Desired.mul((100 - slippage) * 100).div(10000);
  const amount1Min = amount1Desired.mul((100 - slippage) * 100).div(10000);

  const lowerTick = priceToTick(lowerPrice);
  const upperTick = priceToTick(upperPrice);

  const mintParams = {
    poolAddress: config.poolAddress,
    lowerTick,
    upperTick,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
  };

  Promise.all([
    token0.allowance(account, config.managerAddress),
    token1.allowance(account, config.managerAddress),
  ])
    .then(([allowance0, allowance1]) => {
      return Promise.resolve()
        .then(() => {
          if (allowance0.lt(amount0Desired)) {
            return token0
              .approve(config.managerAddress, uint256Max)
              .then((tx) => tx.wait());
          }
        })
        .then(() => {
          if (allowance1.lt(amount1Desired)) {
            return token1
              .approve(config.managerAddress, uint256Max)
              .then((tx) => tx.wait());
          }
        })
        .then(() => {
          return manager.mint(mintParams).then((tx) => tx.wait());
        })
        .then(() => {
          alert("Liquidity minted");
        });
    })
    .catch(() => {
      alert("Liquidity failed");
    });
};

const BackButton = ({ onClick }) => {
  return (
    <button className="text-white text-xl" onClick={onClick}>
      ← Back
    </button>
  );
};

const PriceRange = ({
  lowerPrice,
  upperPrice,
  setLowerPrice,
  setUpperPrice,
  disabled,
}) => {
  return (
    <fieldset className="flex flex-col justify-center w-full">
      <label
        htmlFor="upperPrice"
        className="text-white font-bold text-3xl my-3"
      >
        Price range
      </label>
      <div className="flex justify-between items-center ">
        <input
          type="text"
          className="text-3xl text-white px-3 rounded-xl py-3 w-full bg-[#2e2d2d] outline-none"
          id="lowerPrice"
          placeholder="0.0"
          readOnly={disabled}
          value={lowerPrice}
          onChange={(ev) => setLowerPrice(ev.target.value)}
        />
        <span className="text-white font-bold text-3xl">&nbsp;-&nbsp;</span>
        <input
          type="text"
          className="text-3xl text-white px-3 rounded-xl py-3 w-full bg-[#2e2d2d] outline-none"
          id="upperPrice"
          placeholder="0.0"
          readOnly={disabled}
          value={upperPrice}
          onChange={(ev) => setUpperPrice(ev.target.value)}
        />
      </div>
    </fieldset>
  );
};

const AmountInput = ({ amount, disabled, setAmount, token }) => {
  return (
    <fieldset className="flex justify-between items-center px-3 py-2 space-x-5">
      <label htmlFor={token + "_liquidity"} className="text-white text-xl ">
        {token}
      </label>
      <input
        id={token + "_liquidity"}
        className="text-3xl text-white px-3 rounded-xl py-3 w-full bg-[#2e2d2d] outline-none"
        onChange={(ev) => setAmount(ev.target.value)}
        placeholder="0.0"
        readOnly={disabled}
        type="text"
        value={amount}
      />
    </fieldset>
  );
};

const LiquidityForm = ({ pair, toggle }) => {
  const metamaskContext = useContext(MetaMaskContext);
  const enabled = metamaskContext.status === "connected";
  const poolInterface = new ethers.utils.Interface(config.ABIs.Pool);

  const [token0, setToken0] = useState();
  const [token1, setToken1] = useState();
  const [manager, setManager] = useState();
  const [quoter, setQuoter] = useState();

  const [amount0, setAmount0] = useState("0");
  const [amount1, setAmount1] = useState("0");
  const [lowerPrice, setLowerPrice] = useState(0);
  const [upperPrice, setUpperPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken0(
      new ethers.Contract(
        config.token0Address,
        config.ABIs.ERC20,
        new ethers.providers.Web3Provider(window.ethereum).getSigner()
      )
    );
    setToken1(
      new ethers.Contract(
        config.token1Address,
        config.ABIs.ERC20,
        new ethers.providers.Web3Provider(window.ethereum).getSigner()
      )
    );
    setManager(
      new ethers.Contract(
        config.managerAddress,
        config.ABIs.Manager,
        new ethers.providers.Web3Provider(window.ethereum).getSigner()
      )
    );

    setQuoter(
      new ethers.Contract(
        config.quoterAddress,
        config.ABIs.Quoter,
        new ethers.providers.Web3Provider(window.ethereum).getSigner()
      )
    );
  }, []);

  const updateAmount = debounce((amount, setAmountFunc) => {
    if (amount === 0 || amount === "0") {
      return;
    }

    setLoading(true);
    quoter.callStatic
      .quote({
        pool: config.poolAddress,
        amountIn: ethers.utils.parseEther(amount),
        sqrtPriceLimitX96: 0,
        zeroForOne: true,
      })

      .then(({ amountOut, sqrtPriceX96After }) => {
        if (amountOut > 0) {
          true
            ? setAmount1(ethers.utils.formatEther(amountOut))
            : setAmount0(ethers.utils.formatEther(amountOut));
          setPriceAfter(sqrtPriceX96After);
        } else {
          setAmountFunc(amount);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("Quoter error", err);
        setLoading(false);
      });
  });

  const setAmount_ = (setAmountFn) => {
    return (amount) => {
      amount = amount || 0;
      setAmountFn(amount);
      updateAmount(amount);
    };
  };

  const addLiquidity_ = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Add L");
    addLiquidity(
      metamaskContext.account,
      lowerPrice,
      upperPrice,
      amount0,
      amount1,
      { token0, token1, manager }
    );
  };

  return (
    <section className="grid h-full place-items-center px-3 bg-transparent">
      <form className="flex flex-col justify-center items-start h-full space-y-3">
        <BackButton onClick={toggle} />
        <p className="text-white">
          Price of ETH per USDC :<span className="font-bold text-xl">5000</span>
        </p>
        <PriceRange
          disabled={!enabled || loading}
          lowerPrice={lowerPrice}
          upperPrice={upperPrice}
          setLowerPrice={setLowerPrice}
          setUpperPrice={setUpperPrice}
        />
        <AmountInput
          amount={amount0}
          disabled={!enabled || loading}
          setAmount={setAmount_(true ? setAmount0 : setAmount1)}
          token={pair.token0}
        />
        <AmountInput
          amount={amount1}
          disabled={!enabled || loading}
          setAmount={setAmount_(false ? setAmount0 : setAmount1)}
          token={pair.token1}
        />
        <button
          className="hover:bg-[#57dede] cursor-pointer transition-colors bg-[#3e4040] text-white w-full font-bold text-3xl py-3 px-4 rounded-2xl"
          disabled={!enabled || loading}
          onClick={addLiquidity_}
        >
          Add liquidity
        </button>
      </form>
    </section>
  );
};

export default LiquidityForm;
