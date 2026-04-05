"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/app/_components/header"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar"
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ScissorsIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"

interface BookingWithService {
  id: string
  date: string
  service: {
    id: string
    name: string
    price: number
    imageUrl: string
    barbershop: {
      id: string
      name: string
      address: string
      imageUrl: string
    }
  }
}

const BookingsPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchBookings()
    }
  }, [session])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/bookings")
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${cancelId}`, { method: "DELETE" })
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== cancelId))
        setCancelId(null)
      }
    } catch {
      // ignore
    } finally {
      setCancelling(false)
    }
  }

  const now = new Date()
  const upcomingBookings = bookings.filter((b) => new Date(b.date) >= now)
  const pastBookings = bookings.filter((b) => new Date(b.date) < now)

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="p-5">
        <h1 className="mb-6 text-xl font-bold">Meus Agendamentos</h1>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2Icon size={16} className="animate-spin" />
            Carregando...
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <CalendarIcon size={48} className="text-gray-600" />
            <div>
              <h2 className="font-semibold">Nenhum agendamento</h2>
              <p className="text-sm text-gray-400">
                Você ainda não fez nenhum agendamento.
              </p>
            </div>
            <Button variant="secondary" onClick={() => router.push("/")}>
              Explorar barbearias
            </Button>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcomingBookings.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
                  Confirmados
                </h2>
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      upcoming
                      onCancel={() => setCancelId(booking.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
                  Finalizados
                </h2>
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelId} onOpenChange={(v) => !v && setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Manter
            </Button>
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling && (
                <Loader2Icon size={16} className="mr-2 animate-spin" />
              )}
              Cancelar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface BookingCardProps {
  booking: BookingWithService
  upcoming?: boolean
  onCancel?: () => void
}

const BookingCard = ({
  booking,
  upcoming = false,
  onCancel,
}: BookingCardProps) => {
  const date = new Date(booking.date)
  return (
    <Card>
      <CardContent className="flex justify-between p-0">
        {/* LEFT */}
        <div className="flex flex-col gap-2 py-5 pl-5">
          <Badge variant={upcoming ? "default" : "secondary"} className="w-fit">
            {upcoming ? "Confirmado" : "Finalizado"}
          </Badge>

          <h3 className="font-semibold">{booking.service.name}</h3>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={booking.service.barbershop.imageUrl} />
            </Avatar>
            <p className="text-sm">{booking.service.barbershop.name}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPinIcon size={12} />
            <span>{booking.service.barbershop.address}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ScissorsIcon size={12} />
            <span>
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(booking.service.price))}
            </span>
          </div>

          {upcoming && onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-1 w-fit gap-1 px-0 text-xs text-red-400 hover:text-red-300"
              onClick={onCancel}
            >
              <Trash2Icon size={12} />
              Cancelar
            </Button>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex min-w-[90px] flex-col items-center justify-center gap-1 border-l border-solid px-5">
          <p className="text-xs capitalize text-gray-400">
            {date.toLocaleDateString("pt-BR", { month: "long" })}
          </p>
          <p className="text-3xl font-bold">
            {date.getDate().toString().padStart(2, "0")}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <ClockIcon size={12} className="text-primary" />
            <span>
              {date.getHours().toString().padStart(2, "0")}:
              {date.getMinutes().toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingsPage
