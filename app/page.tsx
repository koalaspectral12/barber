export const dynamic = "force-dynamic"

import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import { db } from "./_lib/prisma"
import BarbershopItem from "./_components/barbershop-item"
import { quickSearchOptions } from "./_constants/search"
import Search from "./_components/search"
import BannerCarousel from "./_components/banner-carousel"
import UpcomingBookings from "./_components/upcoming-bookings"
import Link from "next/link"
import Image from "next/image"

const Home = async () => {
  let barbershops: Awaited<ReturnType<typeof db.barbershop.findMany>> = []
  let popularBarbershops: typeof barbershops = []
  let appName = "Barberon"
  let banners: string[] = []

  try {
    const [shops, popular, settings] = await Promise.all([
      db.barbershop.findMany({ take: 10 }),
      db.barbershop.findMany({ orderBy: { name: "asc" }, take: 10 }),
      db.appSettings.findUnique({ where: { id: "singleton" } }),
    ])
    barbershops = shops
    popularBarbershops = popular
    appName = settings?.appName || "Barberon"
    banners = (() => {
      try {
        return JSON.parse(settings?.banners || "[]")
      } catch {
        return []
      }
    })()
  } catch {
    // DB not available at build time — render with defaults
  }

  return (
    <div>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">Olá! Bem-vindo ao {appName}</h2>
        <p className="text-gray-400">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </p>

        <div className="mt-6">
          <Search />
        </div>

        <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          {quickSearchOptions.map((option) => (
            <Button
              className="gap-2"
              variant="secondary"
              key={option.title}
              asChild
            >
              <Link href={`/barbershops?service=${option.title}`}>
                <Image
                  src={option.imageUrl}
                  width={16}
                  height={16}
                  alt={option.title}
                />
                {option.title}
              </Link>
            </Button>
          ))}
        </div>

        <BannerCarousel banners={banners} appName={appName} />

        <UpcomingBookings />

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
