import { Checkbox } from "@asif-sirajudeen/earth-ui/checkbox"
import { Label } from "@asif-sirajudeen/earth-ui/label"

export default function LabelDemo() {
  return (
    <div className="flex gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  )
}
