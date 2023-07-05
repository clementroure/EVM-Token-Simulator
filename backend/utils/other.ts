
import runHostileCode from './isolated'
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

export const isolate = async (event:any) => {
    const success = await runHostileCode(event.data.code, 128)
    console.log('isloated code run: ' + success)
  }
  
  export async function getABI(address: string, network: string = 'goerli') {
    const etherscan_apiKey = process.env.ETHERSCAN_API_KEY as string;
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
      //   break;
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  
    try {
      const { data } = await axios.get(url);
      
      if (data.status === '1') {
        return JSON.parse(data.result);
      } else {
        throw new Error('Failed to fetch ABI');
      }
    } catch (error) {
      console.error('Axios request failed:', error);
      throw error;
    }
  }
  

  export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
