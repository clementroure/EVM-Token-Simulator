"use client"

import { Table } from "@tanstack/react-table"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { DataTableViewOptions } from "./data-table-view-options"

import { json2csv } from 'json-2-csv';

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  data: any
}

export function DataTableToolbar<TData>({
  table,
  data,
}: DataTableToolbarProps<TData>) {

  const downloadFile = async (data:any) => {

    console.log(data)
    
    if(data.length === 0){
      return;
    }
    const fields = ['step', 'agent', 'action', 'value'];
    // The json2csvAsync function returns a promise, so we use await
    const csv = await json2csv(data, {
        delimiter: {
            wrap  : '"', // Double Quote (") character
            field : ';', // Comma field delimiter
        },
        keys: fields
    });

    // Create a blob of the data
    let blob = new Blob([csv], { type: 'text/csv' });

    // Create a link element
    let downloadLink = document.createElement('a');

    // Create a 'href' for our link using the 'URL' web API and our blob data
    downloadLink.href = URL.createObjectURL(blob);

    // Set the download attribute of the link to the CSV file name
    downloadLink.download = 'data.csv';

    // Append the link to the document body
    document.body.appendChild(downloadLink);

    // Trigger click of download link
    downloadLink.click();

    // Cleanup - remove the link from the document
    document.body.removeChild(downloadLink);
  }

  const isFiltered =
    table.getPreFilteredRowModel().rows.length >
    table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("agent")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("agent")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* {table.getColumn("value") && (
          <DataTableFacetedFilter
            column={table.getColumn("value")}
            title="Status"
            options={statuses}
          />
        )} */}
        {/* {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <Button variant="outline" size="sm" className="mr-4 h-[32px]" onClick={() => downloadFile(data)}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <DataTableViewOptions table={table} />

    </div>
  )
}
