import { Chart } from "@/components/chart"
import { SliderData } from "@/components/slider"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"

export const Prices = ({
    params, setParams,
    data, runPrice,
    handleFileChange,
    simulationStep,
}: any) => {

    useEffect(() => {
      runPrice()
    },[simulationStep])

    return(
        <> 
        <Card className='shadow'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
                Market Price
            </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <SliderData
                    name='Initial Asset Price' 
                    hint='This is the initial asset price. It sets the starting point for the simulation.' 
                    max={100000}
                    min={0}
                    step={50}
                    value={params.S0}
                    setValue={(newValue) => setParams((prevParams: any) => ({ ...prevParams, S0: newValue }))}
                    />
                    <SliderData
                    name='Expected Return Rate' 
                    hint='This is the expected return rate (drift) of the asset in the absence of jumps. It is often based on historical returns of the asset.' 
                    max={0.5}
                    min={-0.5}
                    step={0.02}
                    value={params.mu}
                    setValue={(newValue) => setParams((prevParams: any) => ({ ...prevParams, mu: newValue }))}
                    />
                    <SliderData
                    name='Asset Volatility' 
                    hint='This is the standard deviation of returns (volatility) in the absence of jumps. It is often based on the historical volatility of the asset.' 
                    max={1}
                    min={0}
                    step={0.05}
                    value={params.sigma}
                    setValue={(newValue) => setParams((prevParams: any) => ({ ...prevParams, sigma: newValue }))}
                    />
                    <SliderData
                    name='Expected Jump Size' 
                    hint='This is the expected size of the jumps. A positive value will cause the jumps to increase the asset price on average, while a negative value will cause the jumps to decrease the asset price on average.' 
                    max={1}
                    min={-1}
                    step={0.05}
                    value={params.muJ}
                    setValue={(newValue) => setParams((prevParams: any) => ({ ...prevParams, muJ: newValue }))}
                    />
                    <SliderData
                    name='Jump Size Variability' 
                    hint='This is the standard deviation of the jump sizes. A higher value will make the jump sizes more variable.' 
                    max={1}
                    min={0}
                    step={0.05}
                    value={params.sigmaJ}
                    setValue={(newValue) => setParams((prevParams: any) => ({ ...prevParams, sigmaJ: newValue }))}
                    />
                    <SliderData
                    name='Average Number of Jumps Per Time Unit' 
                    hint='This is the average number of jumps per time unit (often per year). A higher value will make jumps more frequent.' 
                    max={1}
                    min={0}
                    step={0.05}
                    value={params.lambda}
                    setValue={(newValue) => setParams((prevParams: any) => ({ ...prevParams, lambda: newValue }))}
                    />
                </div>
                <div className="flex flex-row mt-8">
                    <Button variant="default" onClick={runPrice}>Simulate</Button>
                    <Label className="mx-6 my-auto h-full">or</Label>
                    <div className="grid w-60 max-w-sm items-center">
                        <Input id="csv" type="file" accept=".csv" onChange={handleFileChange}/>
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="max-w-[1200px] mx-auto ml-[52px]">
            <Card className='shadow'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                    Graph
                </CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart data={data}/>
                </CardContent>
            </Card>
        </div>
        <div className="h-6"/>
        </>
        )
    }