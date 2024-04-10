import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Theme } from "@radix-ui/themes";
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia, arbitrumSepolia, arbitrum } from "viem/chains";

import "@/assets/style/tailwind.css";
import "@/assets/style/global.css";
import "@arco-design/web-react/dist/css/arco.css";
import { isProd } from "./config";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "b7d32f395b889b7ec2e721ecb1cccb61";

const chains = isProd ? [mainnet, arbitrum] : [sepolia, arbitrumSepolia];
// 2. Create wagmiConfig
const metadata = {
    name: 'Web3Modal',
    description: 'Web3Modal Example',
    url: 'https://web3modal.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    // ...wagmiOptions // Optional - Override createConfig parameters
})

// 3. Create modal
createWeb3Modal({
    wagmiConfig: config,
    projectId,
    themeMode: "light" 
  })

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RecoilRoot>
            <Theme>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </WagmiProvider>
            </Theme>
        </RecoilRoot>
    </React.StrictMode>
);
