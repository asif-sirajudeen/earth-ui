import { Button } from "@asif-sirajudeen/earth-ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asif-sirajudeen/earth-ui/tooltip"

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        Hover
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  )
}
