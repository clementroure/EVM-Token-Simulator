"use client"
 
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
 
const frameworks = [
  {
    value: "ethereum mainnet",
    label: "Ethereum mainnet",
  },
  {
    value: "ethereum goerli",
    label: "Ethereum goerli",
  },
  {
    value: "ethereum sepolia",
    label: "Ethereum sepolia",
  },
  {
    value: "polygon mainnet",
    label: "Polygon mainnet",
  },
  {
    value: "polygon mumbai",
    label: "Polygon mumbai",
  },
]
 
export function ComboboxDemo(props: any) {
  const [open, setOpen] = React.useState(false)
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {props.value
            ? frameworks.find((framework) => framework.value === props.value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                onSelect={() => {
                  props.handleChange(framework.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    props.value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}