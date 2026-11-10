import { Field, FieldLabel } from "@asif-sirajudeen/earth-ui/field"
import { Textarea } from "@asif-sirajudeen/earth-ui/textarea"

export function TextareaDisabled() {
  return (
    <Field data-disabled>
      <FieldLabel htmlFor="textarea-disabled">Message</FieldLabel>
      <Textarea
        id="textarea-disabled"
        placeholder="Type your message here."
        disabled
      />
    </Field>
  )
}
