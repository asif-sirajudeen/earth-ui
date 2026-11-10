import { Badge } from "@asif-sirajudeen/earth-ui/badge"
import { Field, FieldLabel } from "@asif-sirajudeen/earth-ui/field"
import { Input } from "@asif-sirajudeen/earth-ui/input"

export function InputBadge() {
  return (
    <Field>
      <FieldLabel htmlFor="input-badge">
        Webhook URL{" "}
        <Badge variant="secondary" className="ml-auto">
          Beta
        </Badge>
      </FieldLabel>
      <Input
        id="input-badge"
        type="url"
        placeholder="https://api.example.com/webhook"
      />
    </Field>
  )
}
