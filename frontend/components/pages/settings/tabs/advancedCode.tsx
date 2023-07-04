import CodeEditor from "@/components/codeEditor"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Code, Luggage } from "lucide-react"
import { useState } from "react"

export const AdvancedCode = ({
  
}: any) => {

    const [diff, setDiff] = useState(false)

    return(
        <>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 w-full">
            <Card className='shadow pb-0'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                    Compare
                </CardTitle>
                <Code className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mt-2">
                        <Switch id="deposit-cancelation" 
                            checked={diff}
                            onCheckedChange={() => setDiff(!diff)}
                        />
                        <Label htmlFor="deposit-cancelation">{diff ? 'On' : 'Off'}</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 w-full">
            <CodeEditor diff={diff}/>
        </div>
        </>
    )
}