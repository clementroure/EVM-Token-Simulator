import { useState, ChangeEvent, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ComboboxDemo } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ContractField {
  name: string;
  address: string;
}

interface TokenField extends ContractField {
  name: string;
  address: string;
  decimals: number;
  amount: number;
}

const Page1 = () => {
  const [contractsFields, setContractsFields] = useState<ContractField[]>([{name: '', address: ''}]);
  const [tokenFields, setTokenFields] = useState<TokenField[]>([{name: '', address: '', decimals: 0, amount: 0}]);
  const [selectedBlockchain, setSelectedBlockchain] = useState("ethereum mainnet");

  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleBlockchainChange = (value: string) => {
    setSelectedBlockchain(value);
  };

  const handleInputChange = (i: number, event: ChangeEvent<HTMLInputElement>, type: 'contract' | 'token') => {
    if (type === 'contract') {
      const newFields = [...contractsFields];
      newFields[i][event.target.name as keyof ContractField] = event.target.value;
      setContractsFields(newFields);
    } else {
      const newFields = [...tokenFields];
      if (event.target.name === 'decimals' || event.target.name === 'amount') {
        newFields[i][event.target.name] = Number(event.target.value) as any;
      } else {
        newFields[i][event.target.name as keyof ContractField] = event.target.value;
      }
      setTokenFields(newFields);
    }
  };

  const handleAddField = (type: 'contract' | 'token') => {
    const lastField = type === 'contract' ? contractsFields[contractsFields.length - 1] : tokenFields[tokenFields.length - 1];
    if (Object.values(lastField).some(field => field === '' || field === 0)) {
      alert('Please fill all fields before adding a new one');
      return;
    }
    if (type === 'contract') {
      setContractsFields([...contractsFields, {name: '', address: ''}]);
    } else {
      setTokenFields([...tokenFields, {name: '', address: '', decimals: 0, amount: 0}]);
    }
  };

  const handleRemoveField = (i: number, type: 'contract' | 'token') => {
    if (type === 'contract') {
      if(contractsFields.length > 1)
      setContractsFields(contractsFields.filter((_, index) => index !== i));
      else
      alert('Cannot remove the field');
    } else {
      if(tokenFields.length > 1)
      setTokenFields(tokenFields.filter((_, index) => index !== i));
      else
      alert('Cannot remove the field');
    }
  };

  // get abi
  async function getABI(address: string, network: string = 'mainnet') {
    const etherscan_apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY as string;
    // const polygonscan_apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY as string;
    let url = '';
    
    switch (network) {
      case 'mainnet':
        url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscan_apiKey}`;
        break;
      case 'goerli':
        url = `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscan_apiKey}`;
        break;
      // case 'polygon':
      //   url = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${polygonscan_apiKey}`;
        break;
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1') {
      return JSON.parse(data.result);
    } else {
      throw new Error('Failed to fetch ABI');
    }
  }

  useEffect(() => {
    const init = async () => {
      const abi = await getABI('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
      console.log(abi)
    }
    init()
  },[])

  return (
    <div className="p-4 space-y-4">
      <Head>
        <title>MyPage</title>
      </Head>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Manage Contracts</h2>
        <Button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-4 py-2"
        >
          Switch to {theme === 'light' ? 'dark' : 'light'} theme
        </Button>
      </div>

      <ComboboxDemo value={selectedBlockchain} handleChange={handleBlockchainChange}/>

      <div>
        {contractsFields.map((field, i) => (
          <div key={i} className="flex space-x-2 mt-2">
            <Button onClick={() => handleRemoveField(i, 'contract')}>X</Button>
            <Input 
              type="text"
              name="name"
              value={field.name}
              onChange={(event) => handleInputChange(i, event, 'contract')}
              placeholder="Name"
            />
             <Input 
              type="text"
              name="address"
              value={field.address}
              onChange={(event) => handleInputChange(i, event, 'contract')}
              placeholder="Contract Address"
            />
          </div>
        ))}
        <Button
          onClick={() => handleAddField('contract')}
          className="px-4 py-2 mt-4"
        >
          Add new contract
        </Button>
      </div>
      <div>
        {tokenFields.map((field, i) => (
          <div key={i} className="flex space-x-2 mt-2">
            <Button onClick={() => handleRemoveField(i, 'token')}>X</Button>
            <Input 
              type="text" 
              name="name"
              value={field.name.toString()}
              onChange={(event) => handleInputChange(i, event, 'token')}
              placeholder="Name"
            />
            <Input 
               type="text"
               name="address"
               value={field.address.toString()}
               onChange={(event) => handleInputChange(i, event, 'token')}
               placeholder="Token Address"
            />
            <Input 
                type="number"
                name="decimals"
                value={field.decimals.toString()}
                onChange={(event) => handleInputChange(i, event, 'token')}
                placeholder="Decimals"
            />
            <Input 
               type="number"
               name="amount"
               value={field.amount.toString()}
               onChange={(event) => handleInputChange(i, event, 'token')}
               placeholder="Amount"
            />
          </div>
        ))}
        <Button
          onClick={() => handleAddField('token')}
          className="px-4 py-2 mt-4"
        >
          Add new token
        </Button>
      </div>
      <Button
        onClick={() => router.push('/simulation')}
        className="px-4 py-2 mt-4"
      >
        Go to next page
      </Button>
    </div>
  );
};

export default Page1;
