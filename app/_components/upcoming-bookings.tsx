"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarImage } from "./ui/avatar"
import { CalendarIcon, ChevronRightIcon } from "lucide-react"

interface Booking {
  id: string
  date: string
  service: {
    name: string
    barbershop: { name: string; imageUrl: string }
  }
}

const UpcomingBookings = () => {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (!session?.user) return
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data: Booking[]) => {
        if (Array.isArray(data)) {
          const now = new Date()
          const upcoming = data
            .filter((b) => new Date(b.date) >= now)
            .slice(0, 2)
          setBookings(upcoming)
        }
      })
      .catch(() => {})
  }, [session])

  if (!session?.user || bookings.length === 0) return null

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase text-gray-400">
          Agendamentos
        </h2>
        <Link
          href="/bookings"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Ver todos
          <ChevronRightIcon size={12} />
        </Link>
      </div>
      <div className="space-y-3">
        {bookings.map((booking) => {
          const date = new Date(booking.date)
          return (
            <Card key={booking.id}>
              <CardContent className="flex justify-between p-0">
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
                <div className="flex flex-col items-center justify-center border-l border-solid px-5">
                  <p className="text-sm capitalize">
                    {date.toLocaleDateString("pt-BR", { month: "long" })}
                  </p>
                  <p className="text-2xl font-bold">
                    {date.getDate().toString().padStart(2, "0")}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <CalendarIcon size={12} className="text-primary" />
                    {date.getHours().toString().padStart(2, "0")}:
                    {date.getMinutes().toString().padStart(2, "0")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default UpcomingBookings
