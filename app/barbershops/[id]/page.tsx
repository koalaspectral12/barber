export const dynamic = "force-dynamic"

import PhoneItem from "@/app/_components/phone-item"
import ServiceItem from "@/app/_components/service-item"
import SidebarSheet from "@/app/_components/sidebar-sheet"
import { Button } from "@/app/_components/ui/button"
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BarbershopPageProps {
  params: { id: string }
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let barbershop: any = null

  try {
    barbershop = await db.barbershop.findUnique({
      where: { id: params.id },
      include: { services: true, paymentConfig: true },
    })
  } catch {
    return notFound()
  }

  if (!barbershop) return notFound()
  if (barbershop.active === false) return notFound()

  const phones: string[] = (() => {
    try {
      return JSON.parse(barbershop.phones)
    } catch {
      return []
    }
  })()

  const hasMercadoPago = !!(
    barbershop.paymentConfig?.active && barbershop.paymentConfig?.mpPublicKey
  )

  return (
    <div>
      <div className="relative h-[250px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={barbershop.name}
          src={barbershop.imageUrl}
          className="h-full w-full object-cover"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4"
          asChild
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="absolute right-4 top-4"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </div>

      <div className="border-b border-solid p-5">
        <h1 className="mb-3 text-xl font-bold">{barbershop.name}</h1>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">5,0 (499 avaliações)</p>
        </div>
      </div>

      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Sobre nós</h2>
        <p className="text-justify text-sm">{barbershop.description}</p>
      </div>

      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Serviços</h2>
        <div className="space-y-3">
          {(barbershop.services ?? []).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (service: any) => (
              <ServiceItem
                key={service.id}
                service={service}
                barbershopName={barbershop.name}
                hasMercadoPago={hasMercadoPago}
                mpPublicKey={
                  barbershop.paymentConfig?.mpPublicKey ?? undefined
                }
              />
            ),
          )}
        </div>
      </div>

      <div className="space-y-3 p-5">
        {phones.map((phone: string) => (
          <PhoneItem key={phone} phone={phone} />
        ))}
      </div>
    </div>
  )
}

export default BarbershopPage
