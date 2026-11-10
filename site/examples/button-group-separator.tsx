import { Button } from "@asif-sirajudeen/earth-ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@asif-sirajudeen/earth-ui/button-group"

export default function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup>
      <Button variant="secondary" size="sm">
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button variant="secondary" size="sm">
        Paste
      </Button>
    </ButtonGroup>
  )
}
