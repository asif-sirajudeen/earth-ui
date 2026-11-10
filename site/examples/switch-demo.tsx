import { Label } from "@asif-sirajudeen/earth-ui/label"
import { Switch } from "@asif-sirajudeen/earth-ui/switch"

export function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  )
}
