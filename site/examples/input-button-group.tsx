import { Button } from "@asif-sirajudeen/earth-ui/button"
import { ButtonGroup } from "@asif-sirajudeen/earth-ui/button-group"
import { Field, FieldLabel } from "@asif-sirajudeen/earth-ui/field"
import { Input } from "@asif-sirajudeen/earth-ui/input"

export function InputButtonGroup() {
  return (
    <Field>
      <FieldLabel htmlFor="input-button-group">Search</FieldLabel>
      <ButtonGroup>
        <Input id="input-button-group" placeholder="Type to search..." />
        <Button variant="outline">Search</Button>
      </ButtonGroup>
    </Field>
  )
}
