import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AgentField, ContractField, DataTableItem, Params, RowData, TokenField } from '@/types/settings';
import { AlertDialogPopup } from '../../alertDialog';
import { useToast } from '../../ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JumpDiffusion from '@/utils/jumpDiffusion';
import Papa from 'papaparse';
import { Prices } from './tabs/prices'
import { Environnment } from './tabs/environnment'
import { Overview } from './tabs/overview'
import Contracts from './tabs/contracts';
import Tokens from './tabs/tokens';
import Agents from './tabs/agents';
import { useStore } from '../../../app/store'
import { Results } from './tabs/results';
import { AdvancedCode } from './tabs/advancedCode';

export const SettingsPage = () => {

const { toast } = useToast()
// alert dialog popup
const [open, setOpen] = useState(false)
const [alertDialogConfig, setAlertDialogConfig] = useState({
    onContinue: () => setOpen(false),
    cancelBtn: 'cancel',
    continueBtn: 'Ok',
    question: 'Are you sure ?',
    msg: 'This action will call the smart contracts.'
  });

  const selectedProduct = useStore(state => state.selectedProduct);
  const selectedChain = useStore(state => state.selectedChain);
  const isSimulating = useStore(state => state.isSimulating);
  const setIsSimulating = useStore(state => state.setIsSimulating);
  const isSimulationLoading = useStore(state => state.isSimulationLoading);
  const setIsSimulationLoading = useStore(state => state.setIsSimulationLoading);
  const simulationProgress = useStore(state => state.simulationProgress);
  const setSimulationProgress = useStore(state => state.setSimulationProgress);

  const [selectedTab, setSelectedTab] = useState('0')

  // form
  const [contractsFields, setContractsFields] = useState<ContractField[]>([{ name: '', address: '' }]);
  const [tokenFields, setTokenFields] = useState<TokenField[]>([{ name: '', address: '', decimals: 0, amount: 0 }]);
  const [agentFields, setAgentFields] = useState<AgentField[]>([{ agent: 'swap_agent', number: 0 }]);

  //environnment
  const [autoMining, setAutoMining] = useState(true)

  // simulation results
  const [simulationResults, setSimulationResults] = useState<DataTableItem[]>([]);

  // load data from csv
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event!.target!.files![0];
    
    if (file.type !== "text/csv") {
      alert("Invalid file type. Please select a CSV file.");
      return;
    }

    if (file) {
      Papa.parse(file, {
        complete: function(results:any) {
          const data = results.data.flat();
          const numbers = data.map(Number);
          // If the last number is 0, remove it
          if (numbers[numbers.length - 1] === 0) {
            numbers.pop();
          }
          // Update the state
          setMarketPrice(numbers)
        }
      });
    }
  };

  const [simulationStep, setSimulationStep] = useState(50)

  // chart data
  const [params, setParams] = useState<Params>({
    S0: 1800,
    mu: 0.02,
    sigma: 0.1,
    muJ: -0.02,
    sigmaJ: 0.15,
    lambda: 0.1,
    T: 1,
    dt: simulationStep,
  });
  const [marketPrice, setMarketPrice] = useState<number[]>([]);

  const runPrice= () => {
    // event.preventDefault();

    const jd = new JumpDiffusion(params.S0, params.mu, params.sigma, params.muJ, params.sigmaJ, params.lambda);
    const path = jd.simulate(params.T, 1 / simulationStep);

    setMarketPrice(path);
    // scrollToBottom()
  };

  const data = {
    labels: marketPrice.map((_, index) => index),
    datasets: [
      {
        label: 'Token Price',
        data: marketPrice,
        backgroundColor: 'rgba(51, 153, 255, 0)',
        borderColor: 'rgba(51, 153, 255, 0.8)',
        tension: 0.3,
        // borderDash: [5, 5],
        fill: {
          target: "origin",
          above: "rgba(51, 153, 255, 0.3)"
        }
      },
    ],
  };

  const socketRef = useRef<WebSocket | null>(null);
  let step=0;

  const runSimulation = () => {

    setIsSimulationLoading(true)
    setIsSimulating(true)
    setSimulationProgress(0)
    setSimulationResults([])
    step = 0;
  
    socketRef.current = new WebSocket("ws://localhost:8080");
  
    socketRef.current.onopen = function(e:any) {
      console.log("[open] Connection established");
      console.log("Sending to server");
  
      let params = {
        command: "uniswap_v2",
        contracts: contractsFields,
        tokens: tokenFields,
        agents: agentFields
      };
  
      socketRef.current!.send(JSON.stringify(params));
  
      const toast_values = {
        contract: params.command,
        agents: params.agents,
      }
      toast({
        title: "Simulation started !",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(toast_values , null, 2)}</code>
          </pre>
        ),
      });
  
    };
  
    socketRef.current.onmessage = function(event:any) {
      const result = JSON.parse(event.data);
  
      if(result.status === 'success'){
        console.log(result.value);
        setIsSimulationLoading(false)
        setIsSimulating(false)
      } 
      else if(result.status == 'step'){
        
        step+=1
        const progressPercentage = (step / params.dt) * 100;
        setSimulationProgress(progressPercentage);

      }
      else if(result.status === 'update'){
  
        console.log(result.value);
        console.log(simulationProgress)
        setIsSimulationLoading(false)

        const newRow: DataTableItem = {
          step: step.toString(),
          agent: result.value.agent,
          action: result.value.action,
          value: result.value.value,
        };
        setSimulationResults(prevResults => [...prevResults, newRow]);
      }
      else if(result.status === 'error'){
        console.error("Error status received with message: ", result.value);
        setIsSimulating(false)
        setIsSimulationLoading(false)
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.value,
        })
      }
    };
  
    socketRef.current.onerror = function(error:any) {
      console.log(`[error] ${error}`)
      setIsSimulating(false)
      setIsSimulationLoading(false)
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Back-end request failed.",
      })
    };
  }

  const abortSimulation = () => {
    if (socketRef.current) {
      socketRef.current.close();
      setIsSimulating(false);
      console.log("WebSocket connection closed");
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    }
  }, []); // No need for dependency array as useRef doesn't cause re-render

  // isolate call bakend
  const callIsolate = (code: string) => {
    let params = {
      command: "isolate",
      code: code
    };
    socketRef.current!.send(JSON.stringify(params));
  }

return (
    <div className='ml-10 space-y-6 w-full pr-10'>

         <AlertDialogPopup 
            open={open} setOpen={setOpen}
            onContinue={alertDialogConfig.onContinue} 
            cancelBtn={alertDialogConfig.cancelBtn}
            continueBtn={alertDialogConfig.continueBtn} 
            question={alertDialogConfig.question}
            msg={alertDialogConfig.msg}
        />

        <div className='space-y-6 w-full'>
            <Card className='shadow w-full'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                    <CardTitle className="text-xl font-semibold">
                        {selectedProduct}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>

          <Tabs onValueChange={(e) => setSelectedTab(e)} value={selectedTab} className="w-full">
            <TabsList>
              <TabsTrigger className="w-28" value="0">Netlist</TabsTrigger>
              <TabsTrigger className="w-28" value="1">Contracts</TabsTrigger>
              <TabsTrigger className="w-28" value="2">Tokens</TabsTrigger>
              <TabsTrigger className="w-28" value="3">Agents</TabsTrigger>
              <TabsTrigger className="w-28" value="4">Market Price</TabsTrigger>
              <TabsTrigger className="w-28" value="5">Advanced</TabsTrigger>
              <TabsTrigger className="w-28" value="6">Overview</TabsTrigger>
              <TabsTrigger className="w-28" value="7">Results</TabsTrigger>
            </TabsList>
            <TabsContent className='w-full mt-4 space-y-6' value="0">
                <Environnment 
                    simulationStep={simulationStep}
                    setSimulationStep={setSimulationStep}
                    autoMining={autoMining}
                    setAutoMining={setAutoMining}
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="1">
                <Contracts 
                  contractFields={contractsFields}
                  setContractFields={setContractsFields}
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="2">
                <Tokens
                   tokenFields={tokenFields}
                   setTokenFields={setTokenFields}
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="3">
                <Agents 
                   agentFields={agentFields}
                   setAgentFields={setAgentFields}
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="4">
                <Prices 
                   params={params} setParams={setParams}
                   data={data} runPrice={runPrice}
                   handleFileChange={handleFileChange}
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="5">
                <AdvancedCode
                    
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="6">
                <Overview 
                 marketPrice={marketPrice}
                 contractFields={contractsFields}
                 tokenFields={tokenFields}
                 agentFields={agentFields}
                 autoMining={autoMining}
                />
            </TabsContent>
            <TabsContent className='w-full mt-4 space-y-6' value="7">
                <Results
                  runSimulation={runSimulation}
                  abortSimulation={abortSimulation}
                  isSimulating={isSimulating}
                  isSimulationLoading={isSimulationLoading}
                />
            </TabsContent>
          </Tabs>
        </div>
    )
}