import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Layers, Menu, Settings } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Switch } from "./ui/switch"
import useWindowWidth from "@/hooks/useWindowWidth"
import { ThemeToggle } from "./theme-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ConnectButton } from "@rainbow-me/rainbowkit"
 
export function BurgerMenu({
    selectedProduct, setSelectedProduct, 
    selectedChain, setSelectedChain ,
    testMode, setTestMode,
    setIsLogged, isPWA
}: any) {

const windowWidth = useWindowWidth();
const [isMobile, setIsMobile] = useState<boolean>(true);

useEffect(() => {
    setIsMobile(windowWidth < 768);
}, [windowWidth]);

const { theme } = useTheme();
const [selectedPage, setSelectedPage] = useState('settings');

const buttonStyles = (buttonName:string) => (selectedPage) === buttonName 
? "secondary" 
: "outline";

//
  const handleTestMode = () => {
    setTestMode(!testMode);
    setSelectedChain(!testMode ? '4' : '1');
  }

  useEffect(() => {
    setSelectedChain(testMode ? '4' : '1')
  },[testMode])
  //

  return (
    <>
    {isMobile &&
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
            <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent position="left" className={`w-[100vw] ${isPWA ? "mt-8" : ""}`}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
          <ScrollArea className="w-[90vw] h-[90vh]">
            <div className="flex flex-row items-start gap-2 w-full overflow-y-auto">
                    <div className="flex flex-col items-start gap-2">
                        <div className="mt-4"/>
                           {/*  <Button 
                                variant={buttonStyles('settings')} 
                                onClick={() => setSelectedPage('settings')} 
                                className="w-[85vw] shadow-sm"
                                disabled={selectedPage == 'settings' ? true : false}
                            >
                            <Settings color={theme == 'dark' ? (selectedPage == 'settings' ? 'gray' : 'white') : (selectedPage == 'settings' ? 'gray' : 'black')} className="h-5 w-5 text-muted-foreground mr-2" />
                                Settings
                            </Button>
                            <Button 
                                variant={buttonStyles('results')} 
                                onClick={() => setSelectedPage('results')} 
                                className="w-full shadow-sm"
                                disabled={selectedPage == 'results' ? true : false}
                            >
                            <Layers color={theme == 'dark' ? (selectedPage == 'results' ? 'gray' : 'white') : (selectedPage == 'results' ? 'gray' : 'black')} className="h-5 w-5 text-muted-foreground mr-2" />
                                Results
                            </Button> */}

                        <Tabs onValueChange={(e) => setSelectedProduct(e)} value={selectedProduct} className="w-[85vw] mt-4">
                            <TabsList>
                            <TabsTrigger className="w-[41vw]" value="Uniswap V2">Uniswap V2</TabsTrigger>
                            <TabsTrigger className="w-[41vw]" value="AAVE">AAVE</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex flex-row w-[85vw] mt-4 space-x-2">
                            <div className="w-full ml-1 mr-2">
                                <Select onValueChange={(e) => setSelectedChain(e)} value={selectedChain}>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {testMode ?
                                    <>
                                        <SelectItem value="4">Goerli</SelectItem>
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
                            <div className="items-center space-x-0">
                                <Switch 
                                    checked={testMode}
                                    onCheckedChange={handleTestMode}
                                    className=""
                                />
                                <Label className="" htmlFor="airplane-mode">{testMode ? 'Testnet' : 'Mainnet'}</Label>
                            </div>
                        </div>

                    </div>
                </div>
                {/* <div className='mt-4 ml-1 items-start justify-start text-left'>
                    <div className='mt-4'>
                    <CheckboxProducts selectedPage={selectedPage} />
                    </div>
                    <div className='mt-4'>
                    <CheckboxChains selectedPage={selectedPage} />
                    </div>
                </div> */}

                {/* <div className="">
                    <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
                </div> */}

                <div className="mt-4 flex flex-row mb-6">
                    <Button className="w-full -mt-0.5 mr-4" variant='outline' onClick={() => setIsLogged(false)}>Logout</Button>
                    <div className="mr-4">
                        <ThemeToggle />
                    </div>
                </div>
            </ScrollArea>
          </SheetDescription>
        </SheetHeader>
        <SheetClose>

        </SheetClose>
      </SheetContent>
    </Sheet>
    }
    </>
  )
}