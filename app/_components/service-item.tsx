"use client"

import { BarbershopService } from "@prisma/client"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import Image from "next/image"

interface ServiceItemProps {
  service: BarbershopService
  barbershopName?: string
}

const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

interface TimeSlot {
  time: string
  available: boolean
}

const ServiceItem = ({ service, barbershopName }: ServiceItemProps) => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [closed, setClosed] = useState(false)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
    setSlots([])
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
    setSlots([])
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const todayMidnight = new Date()
    todayMidnight.setHours(0, 0, 0, 0)
    return date < todayMidnight
  }

  const handleDayClick = (day: number) => {
    if (isDateDisabled(day)) return
    const date = new Date(currentYear, currentMonth, day)
    setSelectedDate(date)
    setSelectedTime(null)
    loadSlots(date)
  }

  const loadSlots = async (date: Date) => {
    setLoadingSlots(true)
    setSlots([])
    setClosed(false)
    try {
      const res = await fetch(
        `/api/barbershops/${service.barbershopId}/hours`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: date.toISOString() }),
        },
      )
      const data = await res.json()
      if (data.closed) {
        setClosed(true)
      } else {
        setSlots(data.slots || [])
      }
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return
    setBooking(true)
    setError("")
    try {
      const [h, m] = selectedTime.split(":").map(Number)
      const bookingDate = new Date(selectedDate)
      bookingDate.setHours(h, m, 0, 0)

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date: bookingDate.toISOString(),
        }),
      })
      if (res.ok) {
        setSuccess(true)
        // Reload slots to show the booked slot as unavailable
        loadSlots(selectedDate)
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao agendar")
      }
    } catch {
      setError("Erro de conexão")
    } finally {
      setBooking(false)
    }
  }

  const handleOpenChange = (v: boolean) => {
    if (v && !session?.user) {
      setLoginOpen(true)
      return
    }
    setOpen(v)
    if (!v) {
      setSuccess(false)
      setError("")
      setSelectedDate(null)
      setSelectedTime(null)
      setSlots([])
    }
  }

  // Reset success after 3 seconds and close
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [success])

  return (
    <>
      {/* Login dialog when user is not authenticated */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="w-[90%]">
          <DialogHeader>
            <DialogTitle>Faça login para agendar</DialogTitle>
            <DialogDescription>
              Entre com sua conta para reservar este serviço.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="outline"
            className="gap-2 font-bold"
            onClick={() => signIn("google")}
          >
            <Image alt="Google" src="/google.svg" width={18} height={18} />
            Entrar com Google
          </Button>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* IMAGE */}
          <div className="max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px] overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={service.name}
              src={service.imageUrl}
              className="h-full w-full object-cover"
            />
          </div>

          {/* INFO */}
          <div className="w-full space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenChange(true)}
              >
                Reservar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Sheet */}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="overflow-y-auto px-0">
          <SheetHeader className="px-5">
            <SheetTitle>Fazer Reserva</SheetTitle>
          </SheetHeader>

          {/* Service summary */}
          <div className="border-b border-solid px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                {barbershopName && (
                  <p className="text-sm text-gray-400">{barbershopName}</p>
                )}
                <p className="font-bold text-primary">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(service.price))}
                </p>
              </div>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="mx-5 mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              ✅ Agendamento confirmado! Até logo.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mx-5 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!success && (
            <>
              {/* Calendar */}
              <div className="border-b border-solid px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={prevMonth}
                    className="p-1 hover:text-primary"
                  >
                    <ChevronLeftIcon size={18} />
                  </button>
                  <span className="font-semibold capitalize">
                    {MONTHS[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1 hover:text-primary"
                  >
                    <ChevronRightIcon size={18} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="mb-1 grid grid-cols-7 text-center">
                  {DAYS_SHORT.map((d) => (
                    <div
                      key={d}
                      className="py-1 text-xs font-medium text-gray-500"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {/* Empty cells for first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const date = new Date(currentYear, currentMonth, day)
                      const isSelected =
                        selectedDate?.toDateString() === date.toDateString()
                      const disabled = isDateDisabled(day)
                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => handleDayClick(day)}
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${isSelected ? "bg-primary font-bold text-primary-foreground" : ""} ${!isSelected && !disabled ? "hover:bg-secondary" : ""} ${disabled ? "cursor-not-allowed text-gray-600" : ""} `}
                        >
                          {day}
                        </button>
                      )
                    },
                  )}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="border-b border-solid px-5 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarIcon size={16} className="text-primary" />
                    <span className="text-sm font-semibold">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                    </span>
                  </div>

                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2Icon size={16} className="animate-spin" />
                      Carregando horários...
                    </div>
                  ) : closed ? (
                    <p className="text-sm text-gray-400">
                      Barbearia fechada neste dia.
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Nenhum horário disponível.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-full border px-3 py-1 text-sm transition-colors ${selectedTime === slot.time ? "border-primary bg-primary font-semibold text-primary-foreground" : ""} ${slot.available && selectedTime !== slot.time ? "border-secondary hover:border-primary hover:text-primary" : ""} ${!slot.available ? "cursor-not-allowed border-gray-700 text-gray-600 line-through" : ""} `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Summary card */}
              {selectedDate && selectedTime && (
                <div className="mx-5 my-4 rounded-lg border border-solid p-4">
                  <h4 className="mb-3 text-sm font-bold uppercase text-gray-400">
                    Resumo da Reserva
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serviço</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    {barbershopName && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Barbearia</span>
                        <span className="font-medium">{barbershopName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data</span>
                      <span className="font-medium">
                        {selectedDate.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Horário</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between border-t border-solid pt-2">
                      <span className="text-gray-400">Preço</span>
                      <span className="font-bold text-primary">
                        {Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(service.price))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <SheetFooter className="px-5 pb-5">
            {!success && (
              <Button
                className="w-full"
                disabled={!selectedDate || !selectedTime || booking}
                onClick={handleBook}
              >
                {booking && (
                  <Loader2Icon size={16} className="mr-2 animate-spin" />
                )}
                {booking ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ServiceItem
