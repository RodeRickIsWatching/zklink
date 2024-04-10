import { shortStr } from "@/utils/tools";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import Spinner from "../spinner";
import { useMemo } from "react";

export default function ConnectButton() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { chains } = useConfig();

  const { switchChain: switchNetwork } = useSwitchChain();
  const unsupported = useMemo(
    () => !chains.find((i) => i.id === chain?.id),
    [chain?.id, chains]
  );

  // const { disconnect } = useDisconnect()

  const { open } = useWeb3Modal();

  const handleOpen = () => {
    if (isConnected) {
      open({ view: "Account" });
      return;
    }
    open({ view: "Connect" });
  };

  const setupDefaultNetwork = () => {
    switchNetwork?.(chains?.[0].id);
  };

  if (isConnected) {
    return (
      <div className="flex flex-row items-center gap-[12px]">
        {unsupported ? (
          <div
            onClick={setupDefaultNetwork}
            className="h-[40px] cursor-pointer flex flex-row items-center justify-center rounded-[12px] py-[11px] px-[16px] bg-[#0000000D] flex flex-row items-center gap-[6px]"
          >
            <svg
              className="w-[24px] h-[24px]"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.7167 16.6667L10.4998 4.16667L3.28292 16.6667H17.7167ZM11.9432 3.33333C11.3017 2.22222 9.69792 2.22222 9.05643 3.33333L1.83955 15.8333C1.19805 16.9444 1.99992 18.3333 3.28292 18.3333H17.7167C18.9997 18.3333 19.8016 16.9444 19.1601 15.8333L11.9432 3.33333Z"
                fill="#FB923C"
              />
              <path
                d="M9.66634 14.5833C9.66634 14.1231 10.0394 13.75 10.4997 13.75C10.9599 13.75 11.333 14.1231 11.333 14.5833C11.333 15.0436 10.9599 15.4167 10.4997 15.4167C10.0394 15.4167 9.66634 15.0436 9.66634 14.5833Z"
                fill="#FB923C"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.66634 12.5V8.33333H11.333V12.5H9.66634Z"
                fill="#FB923C"
              />
            </svg>
            <span>Error Network</span>
          </div>
        ) : null}

        <div
          onClick={handleOpen}
          className="h-[40px] cursor-pointer flex flex-row items-center justify-center rounded-[12px] py-[11px] px-[16px] bg-[#0000000D]"
        >
          <span className="text-[16px] font-[500]">
            {shortStr(address as string, 8)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleOpen}
      className="h-[40px] cursor-pointer flex flex-row items-center justify-center gap-[4px] rounded-[12px] py-[11px] px-[16px] bg-gradient-to-r from-[#395DF2] from-2.05% via-[#2391F6] via-52.55% to-[#B072FF] to-100%"
    >
      {isConnecting ? <Spinner /> : null}
      <span className="text-[16px] font-[700] text-[#fff]">Connect Wallet</span>
    </div>
  );
}
