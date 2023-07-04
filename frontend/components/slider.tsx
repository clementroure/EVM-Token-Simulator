import * as React from "react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface SliderDataProps {
  name: string,
  hint: string,
  max: number,
  min: number,
  step: number,
  value: number,
  setValue: (value: number) => void,
}

export function SliderData({
  name,
  hint,
  max,
  min,
  step,
  value, 
  setValue, 
}: SliderDataProps) {

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  return (
    <div className="grid gap-2 pt-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="slider">{name}</Label>
              <input
                type="number"
                className="w-24 rounded-md border bg-transparent border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border"
                value={value.toString()}
                onChange={(event) => setValue(Number(event.target.value))}
                min={min}
                max={max}
                step={step}
              />
            </div>
            <Slider
              id="slider"
              max={max}
              min={min}
              value={[value]} 
              step={step}
              onValueChange={(values) => setValue(values[0])}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              aria-label="Slider"
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          {hint}
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}