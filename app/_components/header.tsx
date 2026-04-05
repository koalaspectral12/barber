import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { MenuIcon, ScissorsIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { db } from "../_lib/prisma"

const Header = async () => {
  let appName = "Barberon"
  let logoUrl: string | null = null

  try {
    const settings = await db.appSettings.findUnique({
      where: { id: "singleton" },
    })
    appName = settings?.appName || "Barberon"
    logoUrl = settings?.logoUrl || null
  } catch {
    // DB not available — use defaults
  }

  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={appName}
              className="h-8 max-w-[140px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500">
                <ScissorsIcon className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="text-base font-bold text-white">{appName}</span>
            </div>
          )}
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
