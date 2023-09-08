import "./App.css";
import SwapForm from "./components/SwapForm.jsx";
import MetaMask from "./components/MetaMask.jsx";
// import EventsFeed from "./components/EventsFeed.js";
import { MetaMaskProvider } from "./contexts/MetaMask.jsx";

const App = () => {
  return (
    <MetaMaskProvider>
      <div className="App flex flex-col justify-start items-center  h-screen space-y-12  gradient-bg">
        <MetaMask />
        <SwapForm />
        <footer>{/* <EventsFeed /> */}</footer>
      </div>
    </MetaMaskProvider>
  );
};

export default App;
