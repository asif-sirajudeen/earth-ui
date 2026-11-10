import { Calendar } from "@asif-sirajudeen/earth-ui/calendar"
import { Card, CardContent } from "@asif-sirajudeen/earth-ui/card"

export function CalendarMultiple() {
  return (
    <Card className="mx-auto w-fit p-0">
      <CardContent className="p-0">
        <Calendar mode="multiple" />
      </CardContent>
    </Card>
  )
}
