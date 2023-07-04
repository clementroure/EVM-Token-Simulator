"use client"
import Link from "next/link"
import Image from 'next/image'

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BurgerMenu } from "./burgerMenu"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useStore } from '../app/store'

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {

  const selectedProduct = useStore(state => state.selectedProduct);
  const setSelectedProduct = useStore(state => state.setSelectedProduct);
  const selectedChain = useStore(state => state.selectedChain);
  const setSelectedChain = useStore(state => state.setSelectedChain);
  const testMode = useStore(state => state.testMode);
  const setTestMode = useStore(state => state.setTestMode);
  const isPWA = useStore(state => state.isPWA);

  const handleTestMode = () => {
    setTestMode(!testMode);
    setSelectedChain(!testMode ? '11155111' : '1');
  }

  useEffect(() => {
    setSelectedChain(testMode ? '11155111' : '1')
  },[testMode])

  return (
    <div className="flex justify-center md:justify-start gap-6 md:gap-10">
      <div className="flex md:hidden">
        <BurgerMenu 
          selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
          selectedChain={selectedChain} setSelectedChain={setSelectedChain}
          testMode={testMode} setTestMode={setTestMode}
          isPWA={isPWA}
        />
      </div>
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo />
        <span className="pl-2 inline-block font-bold">{siteConfig.name}</span>
      </Link>
      <div className="text-sm h-1 w-1 mr-4 sm:hidden block">
        <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
      </div>

      {items?.length ? (
        <>
        <div className="w-60 hidden md:flex">
          <Tabs onValueChange={(e) => setSelectedProduct(e)} value={selectedProduct} className="w-[400px]">
            <TabsList>
              <TabsTrigger className="w-28" value="Uniswap V2">Uniswap V2</TabsTrigger>
              <TabsTrigger className="w-28" value="AAVE">AAVE</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="w-40  hidden lg:flex">
          <Select onValueChange={(e) => setSelectedChain(e)} value={selectedChain}>
            <SelectTrigger>
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {testMode ?
              <>
                <SelectItem value="11155111">Sepolia</SelectItem>
                <SelectItem value="97">BSC Testnet</SelectItem>
                <SelectItem value="80001">Mumbai</SelectItem>
              </>
              :
              <>
                <SelectItem value="1">Ethereum</SelectItem>
                <SelectItem value="56">Binance Chain</SelectItem>
                <SelectItem value="137">Polygon</SelectItem>
              </>
              }
            </SelectContent>
          </Select>
        </div>
        <div className="mt-0 items-center space-x-2 hidden lg:flex">
          <Switch 
            checked={testMode}
            onCheckedChange={handleTestMode}
          />
          <Label htmlFor="airplane-mode">{testMode ? 'Testnet' : 'Mainnet'}</Label>
        </div>
        </>
      ) : null}
    </div>
  )
}
