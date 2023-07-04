import ScrollButton from "@/components/scrollButton"
import { TableData } from "@/components/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { DataTableItem } from "@/types/settings";

export const Overview = ({
  marketPrice,
  contractFields,
  tokenFields,
  agentFields,
  autoMining,
}: any) => {
    const contractData = contractFields
      .filter((contractField: any) => contractField.name && contractField.address)
      .map((contractField: any) => ({
          name: contractField.name,
          address: contractField.address,
    }));

    const tokenData = tokenFields
      .filter((tokenField: any) => tokenField.name && tokenField.address)
      .map((tokenField: any) => ({
          name: tokenField.name,
          address: tokenField.address,
          decimals: tokenField.decimals,
          amount: tokenField.amount,
    }));

    const agentData = agentFields
      .filter((agentField: any) => agentField.agent && agentField.number !== undefined)
      .map((agentField: any) => ({
          agent: agentField.agent,
          number: agentField.number,
    }));

    const marketPriceData = marketPrice.map((price: number, index: number) => ({
      id: index + 1,
      price: price,
    }));

    const environnmentData = [{ Setting: 'Auto mining', Value: autoMining ? 'On' : 'Off' }];

    return(
      <>
        <Card className='shadow'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 scrollbar-thin scrollbar-thumb-scrollbar scrollbar-thumb-gray-200 scrollbar-track-gray-50 dark:scrollbar-thumb-gray-900 dark:scrollbar-track-black !max-h-[400px] overflow-y-auto rounded">
              <TableData data={contractData}/>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 scrollbar-thin scrollbar-thumb-scrollbar scrollbar-thumb-gray-200 scrollbar-track-gray-50 dark:scrollbar-thumb-gray-900 dark:scrollbar-track-black !max-h-[400px] overflow-y-auto rounded">
              <TableData data={tokenData}/>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 scrollbar-thin scrollbar-thumb-scrollbar scrollbar-thumb-gray-200 scrollbar-track-gray-50 dark:scrollbar-thumb-gray-900 dark:scrollbar-track-black !max-h-[400px] overflow-y-auto rounded">
              <TableData data={agentData}/>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Market Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 scrollbar-thin scrollbar-thumb-scrollbar scrollbar-thumb-gray-200 scrollbar-track-gray-50 dark:scrollbar-thumb-gray-900 dark:scrollbar-track-black !max-h-[400px] overflow-y-auto rounded">
              <TableData data={marketPriceData}/>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Environnment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 scrollbar-thin scrollbar-thumb-scrollbar scrollbar-thumb-gray-200 scrollbar-track-gray-50 dark:scrollbar-thumb-gray-900 dark:scrollbar-track-black !max-h-[400px] overflow-y-auto rounded">
              <TableData data={environnmentData}/>
            </div>
          </CardContent>
        </Card>

        <div className="h-6"/>
        <ScrollButton />
      </>
    )
}
