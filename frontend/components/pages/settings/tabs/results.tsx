import ScrollButton from "@/components/scrollButton"
import { DataTable } from "@/components/table/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { columns } from '@/components/table/columns';
import { useStore } from "@/app/store";
import { AlertDialogButton } from "@/components/alertDialogButton";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Chart } from "@/components/chart"
import { DataTableItem } from "@/types/settings";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Results = ({
    runSimulation, 
    abortSimulation,
    isSimulating,
    isSimulationLoading,
    simulationResults,
    marketPrice,
    currentMarketPrice, setCurrentMarketPrice,
    currentStep, setCurrentStep,
    stepList, setStepList,
}: any) => {

  const simulationProgress = useStore(state => state.simulationProgress);

  const [selectedTab, setSelectedTab] = useState('0')

  const swapSimulationResults = simulationResults.filter((item: DataTableItem) => item.agent.includes('swap'));
  const liquiditySimulationResults = simulationResults.filter((item: DataTableItem) => item.agent.includes('liquidity'));
  
  useEffect(() => {
    if (simulationResults.length > 1) {
      if (simulationResults[simulationResults.length - 1].step > currentStep) {
        setCurrentStep((prevStep: any) => prevStep + 1);
        setCurrentMarketPrice((prevMarketPrice: any) => [...prevMarketPrice, marketPrice[currentStep + 1]]);
        setStepList((prevStepList: any) => [...prevStepList, currentStep+1])
        console.log(simulationResults[simulationResults.length - 1].step);
        console.log('currentMarketPrice');
        console.log(currentMarketPrice);
      }
    }else{
        setCurrentStep(0)
        setCurrentMarketPrice([marketPrice[0]])
        setStepList([0])
    }
  }, [simulationResults]);
    
    
  const swapGraphData = {
      labels: swapSimulationResults.map((item: DataTableItem) => item.step),
      datasets: [
          {
              label: 'Price Impact',
              data: swapSimulationResults.map((item: DataTableItem) => parseFloat(item.value)),
              fill: false,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
          },
      ],
  };
  const liquidityGraphData = {
    labels: liquiditySimulationResults.map((item: DataTableItem) => item.step),
    datasets: [
      {
        label: 'Impermanent Loss',
        data: liquiditySimulationResults.map((item: DataTableItem) => parseFloat(item.value)),
        fill: false,
        backgroundColor: 'rgba(255, 0, 255, 0.3)', 
        borderColor: 'rgba(255, 0, 255, 0.8)', 
      },
    ],
  };  
  const marketPriceGraphData = {
    labels: stepList,
    datasets: [
      {
        label: 'Market Price',
        data: currentMarketPrice,
        fill: false,
        backgroundColor: 'rgba(0,128,0,0.4)', 
        borderColor: 'rgba(0,128,0,1)',
      },
    ],
  };  
  const poolPriceGraphData = {
    labels: swapSimulationResults.map((item: DataTableItem) => item.step),
    datasets: [
        {
            label: 'Pool Price',
            data: swapSimulationResults.map((item: DataTableItem) => parseFloat(item.poolPrice)),
            fill: false,
            backgroundColor: 'rgba(34,139,34,0.4)',
            borderColor: 'rgba(34,139,34,1)',
        },
    ],
  };

  return (
    <div className='mt-6 w-full'>

        {isSimulationLoading ?
            <Button disabled className="h-10 w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin " />
            Please wait
            </Button>
            :
            <>
            {isSimulating ?
            <AlertDialogButton
                className='h-10 w-full'
                onContinue={abortSimulation} 
                btn='Abort' 
                cancelBtn = 'Continue'
                continueBtn = 'Abort'
                question='Are you sure to abort ?' 
                msg="The simulation will stop and you won't be able to continue."
            />      
            :
            <Button variant="default" onClick={runSimulation} className="h-10 w-full">
              Run Simulation ! 🚀
            </Button>
            }
            </>
        }
        <div className="mt-6 h-8">
            <Progress value={simulationProgress} />
        </div>

        <Tabs onValueChange={(e) => setSelectedTab(e)} value={selectedTab} className="w-full">
            <TabsList>
              <TabsTrigger className="w-28" value="0">Table</TabsTrigger>
              <TabsTrigger className="w-28" value="1">Graph</TabsTrigger>
            </TabsList>
            <TabsContent className='w-full mt-4 space-y-6' value="0">
            {simulationResults.length > 0 &&
                <div className="mt-4 mb-10 space-y-4">
                    <Label className="text-xl md:text-2xl font-bold">Results</Label>
                    <DataTable data={simulationResults} columns={columns}/>
                </div>
            }
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="1">
            {simulationResults.length > 0 &&
                <div className="max-w-[1200px] mx-auto ml-[52px] mb-14 space-y-4">
                    <Label className="text-xl md:text-2xl font-bold">Market Price</Label>
                    <Chart data={marketPriceGraphData} size='lg'/>
                    <div className="h-2"/>
                    <Label className="text-xl md:text-2xl font-bold">pool Price</Label>
                    <Chart data={poolPriceGraphData} size='sm'/>
                    <div className="h-2"/>
                    <Label className="text-xl md:text-2xl font-bold">Swap Agents</Label>
                    <Chart data={swapGraphData} size='sm'/>
                    <div className="h-2"/>
                    <Label className="text-xl md:text-2xl font-bold">Liquidity Agents</Label>
                    <Chart data={liquidityGraphData} size='lg'/>
                </div>
            }
            </TabsContent>
        </Tabs>

        <ScrollButton />
    </div>
  )
}