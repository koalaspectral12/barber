export const dynamic = "force-dynamic"

import BarbershopItem from "../_components/barbershop-item"
import Header from "../_components/header"
import Search from "../_components/search"
import { db } from "../_lib/prisma"

interface BarbershopsPageProps {
  searchParams: {
    title?: string
    service?: string
  }
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  let barbershops: Awaited<ReturnType<typeof db.barbershop.findMany>> = []

  try {
    const orFilter = [
      searchParams?.title ? { name: { contains: searchParams.title } } : {},
      searchParams?.service
        ? { services: { some: { name: { contains: searchParams.service } } } }
        : {},
    ]
    // Try with active filter; fall back if column doesn't exist yet
    try {
      barbershops = await db.barbershop.findMany({
        where: { active: true, OR: orFilter },
      })
    } catch {
      barbershops = await db.barbershop.findMany({ where: { OR: orFilter } })
    }
  } catch {
    // DB not available — render empty state
  }

  const term = searchParams?.title || searchParams?.service || ""

  return (
    <div>
      <Header />
      <div className="my-6 px-5">
        <Search />
      </div>
      <div className="px-5">
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          {term ? `Resultados para "${term}"` : "Todas as barbearias"}
        </h2>
        {barbershops.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {term
              ? `Nenhuma barbearia encontrada para "${term}"`
              : "Nenhuma barbearia cadastrada ainda."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BarbershopsPage
