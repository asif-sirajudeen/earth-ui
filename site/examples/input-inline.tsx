import { Button } from "@asif-sirajudeen/earth-ui/button"
import { Field } from "@asif-sirajudeen/earth-ui/field"
import { Input } from "@asif-sirajudeen/earth-ui/input"

export function InputInline() {
  return (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Search..." />
      <Button>Search</Button>
    </Field>
  )
}
