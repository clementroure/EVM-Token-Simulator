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

interface DataTableItem {
  step: string,
  agent: string,
  action: string,
  value: string,
}

export const Results = ({
    runSimulation, 
    abortSimulation,
    isSimulating,
    isSimulationLoading,
}: any) => {

  const simulationProgress = useStore(state => state.simulationProgress);

  const [dataTable, setDataTable] = useState<DataTableItem[]>([])

  useEffect(() => {
        setDataTable([
            { step: "1", agent: "Pending", action: "John Doe", value: "" },
        ]);
  }, []);

  return (
    <div className='mt-4 w-full'>

        {isSimulationLoading ?
            <Button disabled className="h-10">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
            </Button>
            :
            <>
            {isSimulating ?
            <AlertDialogButton
                onContinue={abortSimulation} 
                btn='Abort' 
                cancelBtn = 'Continue'
                continueBtn = 'Abort'
                question='Are you sure to abort ?' 
                msg="The simulation will stop and you won't be able to continue."
            />      
            :
            <Button onClick={runSimulation} size="sm" className="h-10">
            Launch
            </Button>
            }
            </>
        }
        <div className="mt-6">
            <Progress value={simulationProgress} />
        </div>

        <div className="mt-6">
            <DataTable data={dataTable} columns={columns}/>
        </div>

        <div className="h-6"/>
        <ScrollButton />
       
    </div>
  )
}