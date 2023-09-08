import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import { SettingFilled, ThunderboltFilled } from "@ant-design/icons";
const Dropdown = ({ slippage, setSlippage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = (category) => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className=" text-xl lg:text-2xl cursor-pointer text-[#c1c0bf] hover:text-[#ea580c] font-bold text-left transition-all self-start tracking-wide leading-relaxed"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <SettingFilled className="text-white text-xl" />
      </button>
      <Transition
        show={isOpen}
        enter="transition-opacity duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="absolute   mt-2 py-2   bg-[#0303038d] rounded-lg shadow-lg flex flex-col items-center justify-center px-3"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-4 px-2">
            <span className="flex space-x-2 px-5">
              <ThunderboltFilled className="text-xl text-[#5ad4d4]  " />
              <p className="text-xl text-[#5ad4d4] font-bold">KryptoChange</p>
            </span>
            <hr className="border-b-[1px] border-[#5f6161]" />
          </div>

          <span className="  grid grid-cols-3 ">
            <p className="text-xl col-span-2 text-slate-50">Slippage</p>
            <div className="flex col-span-1">
              <input
                type="text"
                value={slippage}
                onChange={(ev) => setSlippage(ev.target.value)}
                className="bg-transparent outline-none  text-3xl text-white"
              />
              <span className="text-3xl text-white">%</span>
            </div>
          </span>
        </div>
      </Transition>
    </div>
  );
};

export default Dropdown;
