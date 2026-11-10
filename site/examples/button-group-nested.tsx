import { AudioLinesIcon, PlusIcon } from "lucide-react"

import { Button } from "@asif-sirajudeen/earth-ui/button"
import { ButtonGroup } from "@asif-sirajudeen/earth-ui/button-group"
import { Input } from "@asif-sirajudeen/earth-ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asif-sirajudeen/earth-ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asif-sirajudeen/earth-ui/tooltip"

export function ButtonGroupNested() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput placeholder="Send a message..." />
          <Tooltip>
            <TooltipTrigger render={<InputGroupAddon align="inline-end" />}>
              <AudioLinesIcon />
            </TooltipTrigger>
            <TooltipContent>Voice Mode</TooltipContent>
          </Tooltip>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  )
}
