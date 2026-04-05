import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarImage } from "./ui/avatar"

interface BookingItemProps {
  booking?: {
    id: string
    date: string
    service: {
      name: string
      barbershop: {
        name: string
        imageUrl: string
      }
    }
  }
}

const BookingItemPlaceholder = ({ booking }: BookingItemProps) => {
  if (!booking) return null

  const date = new Date(booking.date)

  return (
    <Card>
      <CardContent className="flex justify-between p-0">
        {/* LEFT */}
        <div className="flex flex-col gap-2 py-5 pl-5">
          <Badge className="w-fit">Confirmado</Badge>
          <h3 className="font-semibold">{booking.service.name}</h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={booking.service.barbershop.imageUrl} />
            </Avatar>
            <p className="text-sm">{booking.service.barbershop.name}</p>
          </div>
        </div>
        {/* RIGHT */}
        <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5">
          <p className="text-sm capitalize">
            {date.toLocaleDateString("pt-BR", { month: "long" })}
          </p>
          <p className="text-2xl font-bold">
            {date.getDate().toString().padStart(2, "0")}
          </p>
          <p className="text-sm">
            {date.getHours().toString().padStart(2, "0")}:
            {date.getMinutes().toString().padStart(2, "0")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingItemPlaceholder
