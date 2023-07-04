import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { capitalizeFirstChar } from "@/utils/other";

export function TableData({ data }: any) {
  // Dynamically generate headers from data keys
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

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
                className={columnIndex === 0 ? "w-24" : ""}
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