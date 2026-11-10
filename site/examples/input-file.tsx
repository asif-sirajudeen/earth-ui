import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@asif-sirajudeen/earth-ui/field"
import { Input } from "@asif-sirajudeen/earth-ui/input"

export function InputFile() {
  return (
    <Field>
      <FieldLabel htmlFor="picture">Picture</FieldLabel>
      <Input id="picture" type="file" />
      <FieldDescription>Select a picture to upload.</FieldDescription>
    </Field>
  )
}
