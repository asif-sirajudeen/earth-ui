import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@asif-sirajudeen/earth-ui/field"
import { Textarea } from "@asif-sirajudeen/earth-ui/textarea"

export function TextareaField() {
  return (
    <Field>
      <FieldLabel htmlFor="textarea-message">Message</FieldLabel>
      <FieldDescription>Enter your message below.</FieldDescription>
      <Textarea id="textarea-message" placeholder="Type your message here." />
    </Field>
  )
}
