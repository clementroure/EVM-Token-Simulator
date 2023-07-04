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
 
export function AgentSelector({ index, setAgentFields, agentFields, frameworks }: any) {
  const [open, setOpen] = React.useState(false)

  // This method is used to disable an option if it is already selected
  const isOptionDisabled = (value: string) => {
    return agentFields.some((item: any, itemIndex: number) => item.agent === value && itemIndex !== index);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {agentFields[index].agent
            ? frameworks.find((framework:any) => framework.value === agentFields[index].agent)?.label
            : "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework:any) => (
            <CommandItem
              key={framework.value}
              onSelect={(currentValue) => {
                if (currentValue !== agentFields[index].agent && !isOptionDisabled(currentValue)) {
                  const newFields = [...agentFields];
                  newFields[index].agent = currentValue;
                  setAgentFields(newFields);
                }
                setOpen(false)
              }}
              disabled={isOptionDisabled(framework.value)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  agentFields[index].agent === framework.value ? "opacity-100" : "opacity-0"
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