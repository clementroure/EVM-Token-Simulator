"use client"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import useNetworkStatus from "@/hooks/useNetworkStatus"
import { AlertCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import '@rainbow-me/rainbowkit/styles.css';
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  omniWallet,
  argentWallet,
  imTokenWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, bsc, optimism, arbitrum, sepolia, polygonMumbai, bscTestnet, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import merge from 'lodash.merge';
import {
  getDefaultWallets,
  connectorsForWallets,
  RainbowKitProvider,
  Theme,
  darkTheme,
  lightTheme,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useStore } from '../app/store'

const myDarkTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#FCFCFC',
    accentColorForeground: '#020202',
    connectButtonBackgroundError: '#a40000',
  },
} as Theme);

const myLightTheme = merge(lightTheme(), {
  colors: {
    accentColor: '#020202',
  },
} as Theme);

const demoAppInfo = {
  appName: 'Token Simulator',
};
const projectId = "792b8c7f6ec975891915665a3ec86ecc"

export function SiteHeader() {

  const setIsLogged = useStore(state => state.setIsLogged);
  const isPWA = useStore(state => state.isPWA);
  const testMode = useStore(state => state.testMode);

  const mainnetChainsConfig = configureChains(
    [
      mainnet,
      bsc,
      polygon,
    ],
    [publicProvider()]
  );
  const testnetChainsConfig = configureChains(
    [
      goerli,
      sepolia,
      bscTestnet,
      polygonMumbai,
    ],
    [publicProvider()]
  );
  
  // Use the useState hook to create a state variable and a function to update it
  const [chainsConfig, setChainsConfig] = useState(mainnetChainsConfig);

  useEffect(() => {
     if(testMode) //@ts-ignore
     setChainsConfig(testnetChainsConfig)
     else
     setChainsConfig(mainnetChainsConfig)
  },[testMode])

  const connectors = connectorsForWallets([
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet({ chains: chainsConfig.chains }),
        metaMaskWallet({ chains: chainsConfig.chains, projectId: projectId }),
        walletConnectWallet({ chains: chainsConfig.chains, projectId: projectId }),
        coinbaseWallet({ chains: chainsConfig.chains, appName: projectId }),
      ],
    },
    {
      groupName: 'Others',
      wallets: [
        trustWallet({ chains: chainsConfig.chains, projectId: projectId }),
        argentWallet({ chains: chainsConfig.chains, projectId: projectId }),
        omniWallet({ chains: chainsConfig.chains, projectId: projectId }),
        imTokenWallet({ chains: chainsConfig.chains, projectId: projectId }),
        ledgerWallet({ chains: chainsConfig.chains, projectId: projectId }),
      ],
    },
  ]); 
  
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient: chainsConfig.publicClient,
    webSocketPublicClient: chainsConfig.webSocketPublicClient,
  });

  const isOnline = useNetworkStatus();

  const { setTheme, theme } = useTheme()
  const [rainbowTheme, setRainbowTheme] = useState(myLightTheme)

  useEffect(() => {
   if(theme == 'light')
   setRainbowTheme(myLightTheme)
   else
   setRainbowTheme(myDarkTheme)
  },[theme])

  return (
  <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider appInfo={demoAppInfo} chains={chainsConfig.chains}  theme={rainbowTheme}>
      {typeof window !== 'undefined' ?
      <header className={`sticky z-40 w-full border-b bg-background rounded-b-xl shadow-lg ${isPWA ? "top-8" : "top-0"}`}>
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <MainNav items={siteConfig.mainNav} />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="items-center space-x-4 hidden xl:flex">
              <div className="mr-2">
                  <ConnectButton showBalance={true} accountStatus="avatar" chainStatus="icon" />
              </div>
              <Button variant='outline' onClick={() => setIsLogged(false)}>Logout</Button>
              <ThemeToggle />
            </nav>
          </div>
        </div>
        {!isOnline && 
        <div className="mt-6 mx-24 -mb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Internet connection</AlertTitle>
            <AlertDescription>
              You are offline. Connect to the internet and reload the app.
            </AlertDescription>
          </Alert>  
        </div>    
        }
      </header>
      :
      <></>
      }
    </RainbowKitProvider>
  </WagmiConfig>
  )
}
