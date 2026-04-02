import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import { db } from "./_lib/prisma"
import BarbershopItem from "./_components/barbershop-item"
import { quickSearchOptions } from "./_constants/search"
import Search from "./_components/search"
import BannerCarousel from "./_components/banner-carousel"
import Link from "next/link"
import Image from "next/image"

const Home = async () => {
  const [barbershops, popularBarbershops, settings] = await Promise.all([
    db.barbershop.findMany({ take: 10 }),
    db.barbershop.findMany({ orderBy: { name: "asc" }, take: 10 }),
    db.appSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
  ])

  const appName = settings?.appName || "Barberon"
  const banners: string[] = (() => {
    try { return JSON.parse(settings?.banners || "[]") } catch { return [] }
  })()

  return (
    <div>
      <Header />
      <div className="p-5">
        {/* Saudação dinâmica */}
        <h2 className="text-xl font-bold">Olá! Bem-vindo ao {appName}</h2>
        <p className="text-gray-400">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </p>

        {/* Busca */}
        <div className="mt-6">
          <Search />
        </div>

        {/* Busca Rápida */}
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

        {/* Banner / Carrossel */}
        <BannerCarousel banners={banners} appName={appName} />

        {/* Recomendados */}
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        {/* Populares */}
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
