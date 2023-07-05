import { useStore } from "@/app/store";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { capitalizeFirstChar } from "@/utils/other";

export function TableData({ data }: any) {
    const selectedChain = useStore(state => state.selectedChain);

    // Dynamically generate headers from data keys
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Mapping from chain ID to the correct Etherscan URL
    const etherscanURLMap: {[key: string]: string} = {
        '1': 'https://etherscan.io',          // Ethereum Mainnet
        '4': 'https://goerli.etherscan.io',   // Goerli Testnet
        '11155111': 'https://sepolia.etherscan.io',   // Sepolia Testnet
        '56': 'https://bscscan.com',          // Binance Smart Chain Mainnet
        '97': 'https://testnet.bscscan.com',  // Binance Smart Chain Testnet
        '80001': 'https://mumbai.polygonscan.com', // Mumbai Testnet
        '137': 'https://polygonscan.com'      // Polygon Mainnet
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {headers.map((header, idx) => (
                        <TableHead key={idx} className={idx === 0 ? "w-24" : ""}>
                            {capitalizeFirstChar(header)}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((rowData: any, rowIndex: number) => (
                    <TableRow key={rowIndex}>
                        {headers.map((column, columnIndex) => (
                            <TableCell
                                key={columnIndex}
                                onClick={
                                    column.toLowerCase().includes('address')
                                        ? () => window.open(`${etherscanURLMap[selectedChain]}/address/${rowData[column]}#code`, "_blank")
                                        : undefined
                                }
                                className={columnIndex === 0 ? "w-24" : (column.toLowerCase().includes('address') ? "cursor-pointer text-blue-500 underline" : "")}
                            >
                                {rowData[column]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
