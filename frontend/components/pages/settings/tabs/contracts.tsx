import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Delete } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ContractField {
  name: string;
  address: string;
}

function Contracts({
   contractFields, setContractFields,
}: any) {

  const handleInputChange = (i: number, event: ChangeEvent<HTMLInputElement>) => {
    const newFields = [...contractFields];
    newFields[i][event.target.name as keyof ContractField] = event.target.value;
    setContractFields(newFields);
  };

  const handleRemoveField = (i: number) => {
    const newFields = contractFields.filter((_:any, index:number) => index !== i);
    setContractFields(newFields);
  };

  const handleAddField = () => {
    if (!contractFields.some((field:any) => field && (!field.name || !field.address || !field.address.startsWith('0x') || field.address.length !== 42))) {
      setContractFields([...contractFields, { name: '', address: '' }]);
    } else {
      alert('Invalid fields: Address should start with 0x and be 42 characters long');
    }
  };

  const canAddField = !contractFields.some((field:any) => field && (!field.name || !field.address || !field.address.startsWith('0x') || field.address.length !== 42));

  return (
    <div>
        <Card className='shadow'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            </CardHeader>
            <CardContent>
              {contractFields.map((field:any, i:number) => (
                <div key={i}>
                    <div className='flex flex-row'>
                        {contractFields.length > 1 && (
                          <Button variant="ghost" onClick={() => handleRemoveField(i)} >
                              <Delete className='cursor-pointer focus:scale-105 transition-all'/>
                          </Button>
                        )}
                        <Label className='text-xl font-bold tracking-tight my-auto h-full'>Contract {i + 1}</Label>
                     </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                        <Input
                        type="text"
                        name="name"
                        value={field.name}
                        onChange={(event) => handleInputChange(i, event)}
                        placeholder="Name"
                        />
                        <Input
                        type="text"
                        name="address"
                        value={field.address}
                        onChange={(event) => handleInputChange(i, event)}
                        placeholder="Address"
                        />
                    </div>
                </div>
              ))}
              <Button variant="outline" type="button" onClick={() => handleAddField()} disabled={!canAddField}>
                 Add
              </Button >
            </CardContent>
        </Card>
    </div>
  );
}

export default Contracts;
