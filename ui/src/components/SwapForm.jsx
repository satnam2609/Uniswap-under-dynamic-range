import { ethers } from "ethers";
import { useContext, useState, useEffect } from "react";
import { uint256Max } from "../lib/constants";
import { MetaMaskContext } from "../contexts/MetaMask";
import config from "../config";
import debounce from "../lib/debounce";
import { ArrowDownOutlined, SettingFilled } from "@ant-design/icons";
import { DownOutlined, SmileOutlined } from "@ant-design/icons";

import ModalForm from "./Modal";
import Dropdown from "./Dropdown";

//dropdown for slippage
const items = [
  {
    key: "1",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.antgroup.com"
      >
        1st menu item
      </a>
    ),
  },
  {
    key: "2",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.aliyun.com"
      >
        2nd menu item (disabled)
      </a>
    ),
    icon: <SmileOutlined />,
    disabled: true,
  },
  {
    key: "3",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.luohanacademy.com"
      >
        3rd menu item (disabled)
      </a>
    ),
    disabled: true,
  },
  {
    key: "4",
    danger: true,
    label: "a danger item",
  },
];

const pairs = [{ token0: "WETH", token1: "USDC" }];

const swap = (
  account,
  amountIn,
  slippage,
  priceAfter,
  zeroForOne,
  { tokenIn, token0, token1, manager }
) => {
  const priceLimit = priceAfter.mul((100 - slippage) * 100).div(10000);
  const amountInWei = ethers.utils.parseEther(amountIn);

  const extra = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [token0.address, token1.address, account]
  );

  Promise.all([tokenIn.allowance(account, config.managerAddress)])
    .then(([allowance0]) => {
      return Promise.resolve()
        .then(() => {
          if (allowance0.lt(amountInWei)) {
            return tokenIn
              .approve(config.managerAddress, uint256Max)
              .then((tx) => tx.wait());
          }
        })
        .then(() => {
          return manager
            .swap(
              config.poolAddress,
              zeroForOne,
              amountInWei,
              priceLimit,
              extra
            )
            .then((tx) => tx.wait());
        })
        .then(() => {
          alert("Swap done");
        });
    })
    .catch((err) => {
      console.log("Swap", err);
      alert("Swap failed");
    });
};

const SwapInput = ({
  token,
  amount,
  setAmount,
  disabled,
  readOnly,
  action,
}) => {
  return (
    <fieldset
      disabled={disabled}
      className="w-full flex justify-between bg-black/20 px-3 py-5 rounded-xl"
    >
      <div className="w-full ">
        <p className="text-white ">You {action}</p>
        <div className="flex justify-between">
          <input
            type="text"
            value={amount}
            className="w-full bg-transparent outline-none text-white text-5xl"
            onChange={(ev) => setAmount(ev.target.value)}
            readOnly={readOnly}
          />
          <label htmlFor={token + "_amount"} className="text-white text-3xl">
            {token}
          </label>
        </div>
      </div>
    </fieldset>
  );
};

const ChangeSwapDirection = ({ zeroForOne, setZeroForOne, disabled }) => {
  return (
    <button
      className="absolute top-[33%]  left-[48%] bg-black/30 px-2 py-1  rounded-lg"
      onClick={(ev) => {
        ev.preventDefault();
        setZeroForOne(!zeroForOne);
      }}
      disabled={disabled}
    >
      <ArrowDownOutlined className="text-2xl font-bold text-white" />
    </button>
  );
};

const SlippageControl = ({ slippage, setSlippage }) => {
  return (
    <fieldset>
      <label htmlFor="slippage">Slippage tolerance, %</label>
      <input
        type="text"
        value={slippage}
        onChange={(ev) => setSlippage(ev.target.value)}
      />
    </fieldset>
  );
};

const SwapForm = (props) => {
  const [zeroForOne, setZeroForOne] = useState(true);
  const [slippage, setSlippage] = useState(0.1);
  const [priceAfter, setPriceAfter] = useState();
  const [managingLiquidity, setManagingLiquidity] = useState(false);
  const pair = pairs[0];
  const metamaskContext = useContext(MetaMaskContext);
  const enabled = metamaskContext.status === "connected";
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [token0, setToken0] = useState();
  const [token1, setToken1] = useState();
  const [manager, setManager] = useState();
  const [quoter, setQuoter] = useState();
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

  const swap_ = (e) => {
    e.preventDefault();
    swap(
      metamaskContext.account,
      zeroForOne ? amount0 : amount1,
      slippage,
      priceAfter,
      zeroForOne,
      {
        tokenIn: zeroForOne ? token0 : token1,
        token0,
        token1,
        manager,
      }
    );
  };

  const updateAmount = debounce((amount) => {
    if (amount === 0 || amount === "0") {
      return;
    }

    setLoading(true);
    quoter.callStatic
      .quote({
        pool: config.poolAddress,
        amountIn: ethers.utils.parseEther(amount),
        sqrtPriceLimitX96: 0,
        zeroForOne: zeroForOne,
      })

      .then(({ amountOut, sqrtPriceX96After }) => {
        zeroForOne
          ? setAmount1(ethers.utils.formatEther(amountOut))
          : setAmount0(ethers.utils.formatEther(amountOut));
        setPriceAfter(sqrtPriceX96After);
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

  const toggleLiquidityForm = () => {
    setManagingLiquidity(!managingLiquidity);
  };

  return (
    <section className="flex flex-col justify-center items-center w-[30vw]   rounded-xl mt-5 bg-white/20 border-[1px] border-[#3b3a3a] ">
      <header className="w-full flex justify-between items-center px-4 py-1">
        <h1 className="w-full flex justify-start space-x-4 items-center text-center text-xl font-bold text-white">
          <button>Swap</button>
          <ModalForm
            pair={pair}
            toggle={toggleLiquidityForm}
            open={managingLiquidity}
            setOpen={setManagingLiquidity}
          />
        </h1>

        <button>
          <Dropdown slippage={slippage} setSlippage={setSlippage} />
        </button>
      </header>

      <form className="grid grid-rows-3 px-1  gap-1 h-[45vh] w-full">
        <SwapInput
          amount={zeroForOne ? amount0 : amount1}
          disabled={!enabled || loading}
          readOnly={false}
          setAmount={setAmount_(zeroForOne ? setAmount0 : setAmount1)}
          token={zeroForOne ? pair.token0 : pair.token1}
          action={"pay"}
        />
        <ChangeSwapDirection
          zeroForOne={zeroForOne}
          setZeroForOne={setZeroForOne}
          disabled={!enabled || loading}
        />
        <SwapInput
          amount={zeroForOne ? amount1 : amount0}
          disabled={!enabled || loading}
          readOnly={true}
          token={zeroForOne ? pair.token1 : pair.token0}
          action={"receive"}
        />
        {/* <SlippageControl setSlippage={setSlippage} slippage={slippage} /> */}
        <button
          className={`w-full px-3 py-1 ${
            enabled ? "hover:bg-[#4dd1d1]" : "hover:bg-transparent"
          } rounded-2xl text-xl font-bold text-white ${
            enabled || loading ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          disabled={!enabled || loading}
          onClick={swap_}
        >
          Swap
        </button>
      </form>
    </section>
  );
};

export default SwapForm;
