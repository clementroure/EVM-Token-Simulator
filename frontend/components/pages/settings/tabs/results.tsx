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

export const Results = ({
    runSimulation, 
    abortSimulation,
    isSimulating,
    isSimulationLoading,
    simulationResults,
}: any) => {

  const simulationProgress = useStore(state => state.simulationProgress);

  const filteredSimulationResults = simulationResults.filter((item: DataTableItem) => item.agent.includes('swap'));
  const graphData = {
      labels: filteredSimulationResults.map((item: DataTableItem) => item.step),
      datasets: [
          {
              label: 'Simulation Results',
              data: filteredSimulationResults.map((item: DataTableItem) => parseFloat(item.value)),
              fill: false,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
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

        {simulationResults.length > 0 &&
        <div className="mt-4 mb-10 space-y-4">
            <Label className="text-xl md:text-2xl font-bold">Results</Label>
            <DataTable data={simulationResults} columns={columns}/>
        </div>
        }

        {simulationResults.length > 0 &&
            <div className="max-w-[1200px] mx-auto ml-[52px] mb-14 space-y-4">
                <Label className="text-xl md:text-2xl font-bold">Graph</Label>
                <Chart data={graphData}/>
            </div>
        }

        <ScrollButton />
       
    </div>
  )
}