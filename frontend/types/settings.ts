export interface RowData {
    id: number;
    fee: number;
  }

 export interface InputRowProps {
    updateSettings:any,
    rows:any,
    setRows:any,
    rowsLoadingStates:any,
    selectedProduct:any,
    selectedChain:any
  }



  export  interface Params {
    S0: number;
    mu: number;
    sigma: number;
    muJ: number;
    sigmaJ: number;
    lambda: number;
    T: number;
    dt: number;
  }
  
  export   interface ContractField {
    name: string;
    address: string;
  }
  
  export   interface TokenField extends ContractField {
    decimals: number;
    amount: number;
  }
  
  export   interface AgentField {
    name: string;
    number: number;
  }
  
  export  interface DataTableItem {
    step: string;
    agent: string;
    action: string;
    value: string;
  }