import { Field, FieldLabel } from "@asif-sirajudeen/earth-ui/field"
import { Switch } from "@asif-sirajudeen/earth-ui/switch"

export function SwitchDisabled() {
  return (
    <Field orientation="horizontal" data-disabled className="w-fit">
      <Switch id="switch-disabled-unchecked" disabled />
      <FieldLabel htmlFor="switch-disabled-unchecked">Disabled</FieldLabel>
    </Field>
  )
}
