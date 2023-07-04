import React, { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputRowProps } from "@/types/settings";

export const InputRow: React.FC<InputRowProps> =  ({
  updateSettings,
  rows,
  setRows,
  rowsLoadingStates,
  selectedProduct,
  selectedChain
}: any) => {

  const [localFees, setLocalFees] = useState(rows[selectedProduct][selectedChain]);
  const [localTime, setLocalTime] = useState<Array<number>>([]);

  useEffect(() => {
    setLocalFees(rows[selectedProduct][selectedChain]);
    setLocalTime(rows[selectedProduct][selectedChain]);
  }, [selectedProduct, selectedChain, rows]);

  const handleAddRow = () => {
    const lastFee = localFees[localFees.length - 1];
    if (localFees.length < 5 && lastFee.fee > 0 && lastFee.fee < 100) {
      const newProductFees = [...localFees, { id: localFees.length + 1, fee: 0 }];
      setLocalFees(newProductFees);
    }
  };

  const handleRemoveRow = () => {
    if (localFees.length > 1) {
      const newProductFees = localFees.slice(0, localFees.length - 1);
      setLocalFees(newProductFees);
    }
  };
  
  return (
    <div className="space-y-4">
      {localFees.map((rowData: any, idx: any) => (
        <div key={rowData.id} className="flex items-center space-x-4">
          <Input
            min={0}
            max={99}
            className="w-full"
            type="number"
            placeholder="Time"
            value={localTime[idx]}
            onChange={(e) => {
              const newTime = [...localTime];
              newTime[idx] = Number(e.target.value);
              setLocalTime(newTime);
            }}
          />
          <Input
            min={0}
            max={99}
            className="w-full"
            type="number"
            placeholder="Fee"
            value={rowData.fee}
            onChange={(e) => {
              const newFees = [...localFees];
              newFees[idx].fee = Number(e.target.value);
              setLocalFees(newFees);
            }}
          />
          <Button 
            className='w-full' 
            variant='outline' 
            disabled={rowsLoadingStates[idx] || Number(localFees[idx].fee) <= 0 || Number(localFees[idx].fee) > 99} 
            onClick={() => updateSettings('rows', localFees, setRows, selectedProduct, selectedChain, idx)}
          >
            {rowsLoadingStates[idx] ? "Updating..." : "Update"}
          </Button>
        </div>
      ))}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleAddRow} disabled={ Number(localFees[localFees.length - 1].fee) <= 0 || Number(localFees[localFees.length - 1].fee) > 99}> Add Fee </Button>
        <Button variant="outline" onClick={handleRemoveRow} disabled={localFees.length <= 1}> Remove Fee </Button>
      </div>
    </div>
  );
}
