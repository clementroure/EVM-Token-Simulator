import { SliderData } from "@/components/slider"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FastForward } from "lucide-react"

export const Environnment = ({
    simulationStep,
    setSimulationStep,
    autoMining,
    setAutoMining,
}: any) => {

    return(
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 w-full">
            <Card className='shadow'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                    Simulation Duration
                </CardTitle>
                {/* <Luggage className="h-5 w-5 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                    <SliderData
                        name={`Number of steps: ${simulationStep}`}
                        hint='This is the duration of the simulation.' 
                        max={100}
                        min={1}
                        step={1}
                        value={simulationStep}
                        setValue={(newValue) => setSimulationStep(newValue)}
                    />
                </CardContent>
            </Card>
            <Card className='shadow pb-0'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                    Auto Mining
                </CardTitle>
                <FastForward className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div>
                        <Label className="font-medium">
                            Auto mining add a block for each transaction.
                            If you work with slippage, disable it.
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <Switch id="deposit-cancelation" 
                            checked={autoMining}
                            onCheckedChange={() => setAutoMining(!autoMining)}
                        />
                        <Label htmlFor="deposit-cancelation">{autoMining ? 'On' : 'Off'}</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}