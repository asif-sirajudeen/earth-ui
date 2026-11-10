import { Button } from "@asif-sirajudeen/earth-ui/button"
import { Kbd } from "@asif-sirajudeen/earth-ui/kbd"

export default function KbdButton() {
  return (
    <Button variant="outline">
      Accept{" "}
      <Kbd data-icon="inline-end" className="translate-x-0.5">
        ⏎
      </Kbd>
    </Button>
  )
}
