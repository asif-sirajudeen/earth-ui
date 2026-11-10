import { SearchIcon } from "lucide-react"

import { Button } from "@asif-sirajudeen/earth-ui/button"
import { ButtonGroup } from "@asif-sirajudeen/earth-ui/button-group"
import { Input } from "@asif-sirajudeen/earth-ui/input"

export default function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  )
}
