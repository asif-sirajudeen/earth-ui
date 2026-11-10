import { Button } from "@asif-sirajudeen/earth-ui/button"
import { Textarea } from "@asif-sirajudeen/earth-ui/textarea"

export function TextareaButton() {
  return (
    <div className="grid w-full gap-2">
      <Textarea placeholder="Type your message here." />
      <Button>Send message</Button>
    </div>
  )
}
