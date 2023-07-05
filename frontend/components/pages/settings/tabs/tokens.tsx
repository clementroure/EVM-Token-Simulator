import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Delete } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface TokenField {
  name: string;
  address: string;
  decimals: number;
  amount: number;
}

function Tokens({
   tokenFields, setTokenFields,
}: any) {

  const handleInputChange = (i: number, event: ChangeEvent<HTMLInputElement>) => {
    const newFields = [...tokenFields];
    newFields[i][event.target.name as keyof TokenField] = event.target.value;
    setTokenFields(newFields);
  };

  const handleRemoveField = (i: number) => {
    const newFields = tokenFields.filter((_:any, index:number) => index !== i);
    setTokenFields(newFields);
  };

  const handleAddField = () => {
    if (!tokenFields.some((field:any) => field && (!field.name || !field.address || !field.address.startsWith('0x') || field.address.length !== 42 || isNaN(field.decimals) || isNaN(field.amount)))) {
      setTokenFields([...tokenFields, { name: '', address: '', decimals: 0, amount: 0 }]);
    } else {
      alert('Invalid fields: Address should start with 0x and be 42 characters long. Decimals and amount should be valid numbers');
    }
  };

  const canAddField = !tokenFields.some((field:any) => field && (!field.name || !field.address || !field.address.startsWith('0x') || field.address.length !== 42 || isNaN(field.decimals) || isNaN(field.amount)));

  return (
    <div>
        <Card className='shadow'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            </CardHeader>
            <CardContent>
            {tokenFields && tokenFields.map((field:any, i:number) => (
                <div key={i}>
                  <div className='flex flex-row'>
                    {tokenFields.length > 1 && (
                      <Button variant="ghost" onClick={() => handleRemoveField(i)} >
                        <Delete className='cursor-pointer focus:scale-105 transition-all'/>
                      </Button>
                    )}
                    <Label className='text-xl font-bold tracking-tight my-auto h-full'>
                      {field.name ? field.name : `Token ${i + 1}`}
                    </Label>
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
                        <Input
                        type="number"
                        name="decimals"
                        value={field.decimals}
                        onChange={(event) => handleInputChange(i, event)}
                        placeholder="Decimals"
                        />
                        <Input
                        type="number"
                        name="amount"
                        value={field.amount}
                        onChange={(event) => handleInputChange(i, event)}
                        placeholder="Amount"
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

export default Tokens;
