/**
 * SEED DE TESTE — Barberon
 * ─────────────────────────────────────────────────────────────────
 * Cria:
 *   • 1  SUPERADMIN  — controla tudo e cadastra barbeiros
 *   • 5  ADMINs      — cada um gerencia 1 barbearia
 *   • 5  Barbearias  — cada uma com 3 serviços exclusivos
 *   • 10 Barbeiros   — 2 por barbearia (cadastrados pelo superadmin)
 *   • 3  CLIENTEs    — para simular agendamentos
 *   • 15 Agendamentos — distribuídos entre barbearias
 * ─────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

// ─── Dados base ───────────────────────────────────────────────────────────────

const BARBERSHOP_DATA = [
  {
    name: "Barbearia Vintage",
    address: "Rua das Flores, 123 — Vila Madalena, SP",
    phones: JSON.stringify(["(11) 91111-1111", "(11) 3111-1111"]),
    description:
      "Clássica e sofisticada, a Barbearia Vintage resgata o charme dos salões dos anos 50. Ambiente aconchegante com cadeiras de couro, música jazz e atendimento personalizado. Cada visita é uma viagem no tempo.",
    imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
    services: [
      {
        name: "Corte Clássico",
        description:
          "Corte tradicional com tesoura e pente, acabamento com navalha e loção pós-barba.",
        price: 65.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Barba Completa",
        description:
          "Modelagem de barba com navalha quente, toalha quente e balm hidratante.",
        price: 45.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Combo Vintage",
        description:
          "Corte + barba + sobrancelha + hidratação capilar. O pacote completo do gentleman.",
        price: 120.0,
        imageUrl:
          "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
      },
    ],
  },
  {
    name: "Corte & Estilo",
    address: "Av. Paulista, 456 — Bela Vista, SP",
    phones: JSON.stringify(["(11) 92222-2222", "(11) 3222-2222"]),
    description:
      "Moderna e conectada com as tendências mundiais, a Corte & Estilo é referência em cortes contemporâneos. Nossa equipe acompanha os últimos lançamentos das semanas de moda para trazer o que há de mais atual.",
    imageUrl: "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
    services: [
      {
        name: "Fade Moderno",
        description:
          "Degradê perfeito com máquina, finalizado com pomada matte para looks contemporâneos.",
        price: 70.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Design de Barba",
        description:
          "Contorno artístico da barba com navalha, finalizando com óleo de argan premium.",
        price: 50.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Platinado & Tintura",
        description:
          "Coloração profissional, descoloração ou mechas. Transforme seu visual com segurança.",
        price: 180.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
    ],
  },
  {
    name: "Barba & Navalha",
    address: "Rua Oscar Freire, 789 — Jardins, SP",
    phones: JSON.stringify(["(11) 93333-3333", "(11) 3333-3333"]),
    description:
      "Especialistas em técnicas de navalha, somos o destino dos homens que prezam pelo cuidado com a barba. Utilizamos produtos artesanais importados e técnicas tradicionais portuguesas para um resultado impecável.",
    imageUrl: "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
    services: [
      {
        name: "Barboterapia",
        description:
          "Ritual completo: esfoliação, vapor quente, navalha e máscara hidratante para pele e barba.",
        price: 90.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Corte Navalha",
        description:
          "Corte inteiramente executado com navalha. Técnica rara para quem quer exclusividade.",
        price: 85.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Pézinho & Acabamento",
        description:
          "Definição de linha do pescoço e contorno lateral com precisão de navalha.",
        price: 35.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
    ],
  },
  {
    name: "The Dapper Den",
    address: "Rua Augusta, 101 — Consolação, SP",
    phones: JSON.stringify(["(11) 94444-4444", "(11) 3444-4444"]),
    description:
      "Estilo britânico no coração de São Paulo. Whisky na entrada, música blues ao fundo e barbeiros certificados em Londres. Para o homem que leva sua aparência a sério e não abre mão do melhor.",
    imageUrl: "https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png",
    services: [
      {
        name: "The British Cut",
        description:
          "Corte no estilo inglês side-part com cera natural e secagem com escova round.",
        price: 95.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Gentleman's Shave",
        description:
          "Barbear à moda antiga: escuma em brocha, toalha quente dupla e loção Penhaligon's.",
        price: 110.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Head Massage",
        description:
          "Massagem craniana relaxante com óleos essenciais. 30 minutos de puro relaxamento.",
        price: 75.0,
        imageUrl:
          "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
      },
    ],
  },
  {
    name: "Estilo Urbano",
    address: "Av. Brigadeiro Faria Lima, 202 — Itaim Bibi, SP",
    phones: JSON.stringify(["(11) 95555-5555", "(11) 3555-5555"]),
    description:
      "Pensada para o homem moderno e agitado, a Estilo Urbano oferece atendimento rápido sem abrir mão da qualidade. Agendamento online, wifi liberado e serviço expresso para quem não tem tempo a perder.",
    imageUrl: "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
    services: [
      {
        name: "Express Cut",
        description:
          "Corte rápido e preciso em até 20 minutos. Ideal para o profissional que tem hora marcada.",
        price: 55.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Sobrancelha Masculina",
        description:
          "Design e aparagem de sobrancelha com pinça e navalha para um olhar definido.",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
      },
      {
        name: "Hidratação Capilar",
        description:
          "Tratamento intensivo com máscara nutritiva, vapor e finalização com leave-in.",
        price: 60.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
    ],
  },
]

// ─── Usuários Admin (1 por barbearia) ─────────────────────────────────────────
const ADMIN_USERS = [
  {
    name: "Carlos Mendonça",
    email: "admin.vintage@fswbarber.com",
    password: "admin123",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
  },
  {
    name: "Fernanda Lima",
    email: "admin.corteeestilo@fswbarber.com",
    password: "admin123",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda",
  },
  {
    name: "Roberto Souza",
    email: "admin.barbaenavalha@fswbarber.com",
    password: "admin123",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
  },
  {
    name: "Patricia Alves",
    email: "admin.dapperde@fswbarber.com",
    password: "admin123",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
  },
  {
    name: "Marcos Oliveira",
    email: "admin.estilourbano@fswbarber.com",
    password: "admin123",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos",
  },
]

// ─── Barbeiros (2 por barbearia = 10 total) ────────────────────────────────────
const BARBERS_BY_SHOP = [
  // Barbearia Vintage
  [
    {
      name: "João Navarro",
      email: "joao.navarro@fswbarber.com",
      specialty: "Corte clássico, Navalha",
      bio: "15 anos de experiência em cortes tradicionais. Formado pela Escola de Barbearia de Lisboa.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    },
    {
      name: "Miguel Santos",
      email: "miguel.santos@fswbarber.com",
      specialty: "Barba artística, Coloração",
      bio: "Especialista em barba com técnicas italianas. Participante do campeonato nacional de barbearia 2023.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
    },
  ],
  // Corte & Estilo
  [
    {
      name: "Rafael Costa",
      email: "rafael.costa@fswbarber.com",
      specialty: "Fade, Degradê",
      bio: "Referência em degradê no estado de SP. Mais de 5000 clientes satisfeitos.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael",
    },
    {
      name: "Lucas Ferreira",
      email: "lucas.ferreira@fswbarber.com",
      specialty: "Coloração, Mechas",
      bio: "Colorista certificado. Trabalhou em salões de renome em Nova York e Paris.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    },
  ],
  // Barba & Navalha
  [
    {
      name: "André Rocha",
      email: "andre.rocha@fswbarber.com",
      specialty: "Navalha, Barboterapia",
      bio: "Mestre navalha com técnicas portuguesas. O barbeiro mais premiado da região.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andre",
    },
    {
      name: "Bruno Carvalho",
      email: "bruno.carvalho@fswbarber.com",
      specialty: "Acabamento, Pézinho",
      bio: "Precisão cirúrgica no acabamento. Especialista em linhas e contornos.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno",
    },
  ],
  // The Dapper Den
  [
    {
      name: "William Clarke",
      email: "william.clarke@fswbarber.com",
      specialty: "Estilo britânico, Wet Shave",
      bio: "Formado em Londres pela Academy of Barbering. Traz o verdadeiro estilo inglês para o Brasil.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=William",
    },
    {
      name: "James Hunter",
      email: "james.hunter@fswbarber.com",
      specialty: "Massagem capilar, Relaxamento",
      bio: "Especialista em técnicas de relaxamento e massagem craniana. Experiência de 8 anos.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
  ],
  // Estilo Urbano
  [
    {
      name: "Diego Martins",
      email: "diego.martins@fswbarber.com",
      specialty: "Express Cut, Hidratação",
      bio: "Velocidade sem perder a qualidade. Recorde de 200 cortes em uma semana.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
    },
    {
      name: "Felipe Nunes",
      email: "felipe.nunes@fswbarber.com",
      specialty: "Sobrancelha, Estética masculina",
      bio: "Pioneiro em estética masculina em SP. Especialista em sobrancelha e cuidados com a pele.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe",
    },
  ],
]

// ─── Clientes de teste ─────────────────────────────────────────────────────────
const CUSTOMER_USERS = [
  {
    name: "Pedro Henrique",
    email: "pedro.henrique@gmail.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
  },
  {
    name: "Gabriel Teixeira",
    email: "gabriel.teixeira@gmail.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
  },
  {
    name: "Thiago Barbosa",
    email: "thiago.barbosa@gmail.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thiago",
  },
]

// ─── Utilitários ──────────────────────────────────────────────────────────────

/** Gera uma data futura ou passada aleatória em relação a hoje */
function randomDate(daysOffset: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  d.setHours(
    9 + Math.floor(Math.random() * 9),
    [0, 30][Math.floor(Math.random() * 2)],
    0,
    0,
  )
  return d
}

/** Hash simples para demonstração (em produção use bcrypt!) */
function fakeHash(password: string): string {
  return `$2b$10$DEMO_HASH_${Buffer.from(password).toString("base64")}`
}

// ─── SEED PRINCIPAL ────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n")

  // 1. Limpar banco na ordem correta (FK-safe)
  console.log("🧹 Limpando dados existentes...")
  await prisma.booking.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.barbershopAdmin.deleteMany()
  await prisma.barbershopService.deleteMany()
  await prisma.barbershop.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  console.log("   ✓ Banco limpo\n")

  // ────────────────────────────────────────────────────────────────────────────
  // 2. SUPERADMIN
  // ────────────────────────────────────────────────────────────────────────────
  console.log("👑 Criando SUPERADMIN...")
  const superadmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@fswbarber.com",
      password: fakeHash("super123"),
      role: "SUPERADMIN",
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin",
    },
  })
  console.log(
    `   ✓ ${superadmin.name} — ${superadmin.email} [${superadmin.role}]\n`,
  )

  // ────────────────────────────────────────────────────────────────────────────
  // 3. BARBEARIAS + SERVIÇOS
  // ────────────────────────────────────────────────────────────────────────────
  console.log("💈 Criando barbearias e serviços...")
  const createdBarbershops = []

  for (const shopData of BARBERSHOP_DATA) {
    const { services, ...shopFields } = shopData

    const shop = await prisma.barbershop.create({
      data: {
        ...shopFields,
        services: {
          create: services,
        },
      },
      include: { services: true },
    })

    createdBarbershops.push(shop)
    console.log(`   ✓ ${shop.name} — ${shop.services.length} serviços criados`)
  }
  console.log()

  // ────────────────────────────────────────────────────────────────────────────
  // 4. ADMINS (1 por barbearia)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("🔑 Criando usuários ADMIN (1 por barbearia)...")
  const createdAdmins = []

  for (let i = 0; i < ADMIN_USERS.length; i++) {
    const adminData = ADMIN_USERS[i]
    const shop = createdBarbershops[i]

    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: fakeHash(adminData.password),
        role: "ADMIN",
        emailVerified: new Date(),
        image: adminData.image,
        managedShop: {
          create: {
            barbershopId: shop.id,
          },
        },
      },
    })

    createdAdmins.push(admin)
    console.log(`   ✓ ${admin.name} — ${admin.email} → gerencia "${shop.name}"`)
  }
  console.log()

  // ────────────────────────────────────────────────────────────────────────────
  // 5. BARBEIROS (2 por barbearia, cadastrados pelo superadmin)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("✂️  Criando BARBEIROS (cadastrados pelo superadmin)...")
  const createdBarbers = []

  for (let i = 0; i < BARBERS_BY_SHOP.length; i++) {
    const shopBarbers = BARBERS_BY_SHOP[i]
    const shop = createdBarbershops[i]

    for (const barberData of shopBarbers) {
      const barberUser = await prisma.user.create({
        data: {
          name: barberData.name,
          email: barberData.email,
          password: fakeHash("barber123"),
          role: "BARBER",
          emailVerified: new Date(),
          image: barberData.image,
          barberProfile: {
            create: {
              barbershopId: shop.id,
              specialty: barberData.specialty,
              bio: barberData.bio,
              avatarUrl: barberData.image,
            },
          },
        },
        include: { barberProfile: true },
      })

      createdBarbers.push(barberUser)
      console.log(
        `   ✓ ${barberUser.name} — ${barberUser.email} → ${shop.name}`,
      )
    }
  }
  console.log()

  // ────────────────────────────────────────────────────────────────────────────
  // 6. CLIENTES
  // ────────────────────────────────────────────────────────────────────────────
  console.log("👤 Criando clientes...")
  const createdCustomers = []

  for (const custData of CUSTOMER_USERS) {
    const customer = await prisma.user.create({
      data: {
        name: custData.name,
        email: custData.email,
        role: "CUSTOMER",
        emailVerified: new Date(),
        image: custData.image,
      },
    })
    createdCustomers.push(customer)
    console.log(`   ✓ ${customer.name} — ${customer.email}`)
  }
  console.log()

  // ────────────────────────────────────────────────────────────────────────────
  // 7. AGENDAMENTOS (3 por cliente, distribuídos entre barbearias)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📅 Criando agendamentos...")
  let totalBookings = 0

  for (let ci = 0; ci < createdCustomers.length; ci++) {
    const customer = createdCustomers[ci]

    for (let bi = 0; bi < createdBarbershops.length; bi++) {
      // apenas 1 agendamento por cliente por barbearia (3 barbearias diferentes por cliente)
      if (bi >= 3) break
      const shopIdx = (ci + bi) % createdBarbershops.length
      const shop = createdBarbershops[shopIdx]
      const service =
        shop.services[Math.floor(Math.random() * shop.services.length)]

      // Alterna entre agendamentos passados e futuros
      const daysOffset = bi === 0 ? -7 : bi === 1 ? 3 : 10

      await prisma.booking.create({
        data: {
          userId: customer.id,
          serviceId: service.id,
          date: randomDate(daysOffset),
        },
      })

      totalBookings++
      console.log(
        `   ✓ ${customer.name} → "${service.name}" em "${shop.name}" (${daysOffset > 0 ? "+" : ""}${daysOffset}d)`,
      )
    }
  }
  console.log()

  // ────────────────────────────────────────────────────────────────────────────
  // 8. RESUMO FINAL
  // ────────────────────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════")
  console.log("✅ SEED CONCLUÍDO COM SUCESSO!")
  console.log("═══════════════════════════════════════════════")
  console.log(`   👑 Superadmin : 1`)
  console.log(`   🔑 Admins     : ${createdAdmins.length} (1 por barbearia)`)
  console.log(`   💈 Barbearias : ${createdBarbershops.length}`)
  console.log(
    `   🛎  Serviços   : ${createdBarbershops.reduce((a, s) => a + s.services.length, 0)} (3 por barbearia)`,
  )
  console.log(`   ✂️  Barbeiros  : ${createdBarbers.length} (2 por barbearia)`)
  console.log(`   👤 Clientes   : ${createdCustomers.length}`)
  console.log(`   📅 Agendamentos: ${totalBookings}`)
  console.log("═══════════════════════════════════════════════")
  console.log("\n🔐 CREDENCIAIS DE ACESSO:")
  console.log("─────────────────────────────────────────────")
  console.log("  SUPERADMIN")
  console.log("    Email : superadmin@fswbarber.com")
  console.log("    Senha : super123")
  console.log("")
  console.log("  ADMINS (senha: admin123)")
  ADMIN_USERS.forEach((a, i) => {
    console.log(`    [${i + 1}] ${a.email}  →  ${BARBERSHOP_DATA[i].name}`)
  })
  console.log("")
  console.log("  BARBEIROS (senha: barber123)")
  BARBERS_BY_SHOP.flat().forEach((b) => {
    console.log(`    ${b.email}`)
  })
  console.log("─────────────────────────────────────────────\n")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
