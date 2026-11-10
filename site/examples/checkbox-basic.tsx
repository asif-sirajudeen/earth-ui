import { Checkbox } from "@asif-sirajudeen/earth-ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@asif-sirajudeen/earth-ui/field"

export function CheckboxBasic() {
  return (
    <FieldGroup className="mx-auto w-56">
      <Field orientation="horizontal">
        <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" />
        <FieldLabel htmlFor="terms-checkbox-basic">
          Accept terms and conditions
        </FieldLabel>
      </Field>
    </FieldGroup>
  )
}
