import ERC20 from "./abi/ERC20.json";
import Pool from "./abi/Pool.json";
import Manager from "./abi/Manager.json";
import Quoter from "./abi/Quoter.json";

const config = {
  token0Address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  token1Address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  poolAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  managerAddress: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  quoterAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  ABIs: {
    ERC20,
    Pool,
    Manager,
    Quoter,
  },
};

export default config;
