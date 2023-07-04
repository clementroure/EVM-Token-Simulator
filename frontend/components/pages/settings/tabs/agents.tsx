import React, { ChangeEvent } from 'react';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { Delete } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AgentField {
  name: string;
  number: number;
}

const allOptions = [
  { value: 'swap_agent', label: 'Swap Agent' },
  { value: 'liquidity_agent', label: 'Liquidity Agent' }
];

function Agents({
   agentFields, setAgentFields,
}: any) {

  const handleInputChange = (i: number, event: ChangeEvent<HTMLInputElement>) => {
    const newFields = [...agentFields];
    newFields[i][event.target.name as keyof AgentField] = parseInt(event.target.value);
    setAgentFields(newFields);
  };

  const handleSelectChange = (i: number, selectedOption: any) => {
    const newFields = [...agentFields];
    if(newFields[i]){
      newFields[i].name = selectedOption.value;
      setAgentFields(newFields);
    }
  };

  const handleRemoveField = (i: number) => {
    setAgentFields((prevFields:any) => prevFields.filter((_:any, index:number) => index !== i));
  };
  

  const handleAddField = () => {
    const sumOfNumbers = agentFields.reduce((acc: number, field: any) => acc + (field.number || 0), 0);
    if (agentFields.length < allOptions.length && sumOfNumbers < 20 && !agentFields.some((field: any) => field && (!field.name || field.number <= 0))) {
      setAgentFields([...agentFields, { name: '', number: 1 }]);
    } else {
      alert('You have reached the maximum limit of agents, invalid number or sum of numbers exceeded limit. Each number should be greater than 0 and sum of numbers should not exceed 20');
    }
  };

  const sumOfNumbers = agentFields.reduce((acc: number, field: any) => acc + (field.number || 0), 0);
  const canAddField = agentFields.length < allOptions.length && sumOfNumbers < 20 && !agentFields.some((field: any) => field && (!field.name || field.number <= 0));

  return (
    <div>
        <Card className='shadow'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            </CardHeader>
            <CardContent>
              {agentFields.map((field: any, i: number) => {
                const usedOptions = agentFields.map((field: any) => field.name);
                const options = allOptions.filter((option: any) => !usedOptions.includes(option.value));
                return (
                  <div key={i}>
                      <div className='flex flex-row'>
                          {agentFields.length > 1 && (
                            <Button variant="ghost" onClick={() => handleRemoveField(i)}>
                              <Delete className='cursor-pointer focus:scale-105 transition-all'/>
                            </Button>
                          )}
                          <Label className='text-xl font-bold tracking-tight my-auto h-full'>Agent {i + 1}</Label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                          <Select
                            name="name"
                            value={options.find(option => option.value === field.name)}
                            onChange={(selectedOption: any) => handleSelectChange(i, selectedOption)}
                            options={options}
                            placeholder="Select Agent Type"
                          />
                          <Input
                            min={0}
                            max={20}
                            type="number"
                            name="number"
                            value={field.number}
                            onChange={(event) => handleInputChange(i, event)}
                            placeholder="Number"
                          />
                      </div>
                  </div>
                )
              })}
              <Button variant="outline" type="button" onClick={() => handleAddField()} disabled={!canAddField}>
                 Add
              </Button >
            </CardContent>
        </Card>
    </div>
  );
}

export default Agents;
