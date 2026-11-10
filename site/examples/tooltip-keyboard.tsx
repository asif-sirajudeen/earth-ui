import { SaveIcon } from "lucide-react"

import { Button } from "@asif-sirajudeen/earth-ui/button"
import { Kbd } from "@asif-sirajudeen/earth-ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asif-sirajudeen/earth-ui/tooltip"

export function TooltipKeyboard() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon-sm" />}>
        <SaveIcon />
      </TooltipTrigger>
      <TooltipContent>
        Save Changes <Kbd>S</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
