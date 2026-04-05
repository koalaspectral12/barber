import { Card, CardContent } from "./ui/card"
import { db } from "../_lib/prisma"

const Footer = async () => {
  let appName = "Barberon"

  try {
    const settings = await db.appSettings.findUnique({
      where: { id: "singleton" },
    })
    appName = settings?.appName || "Barberon"
  } catch {
    // DB not available — use defaults
  }

  const year = new Date().getFullYear()

  return (
    <footer>
      <Card>
        <CardContent className="px-5 py-6">
          <p className="text-sm text-gray-400">
            © {year} Copyright{" "}
            <span className="font-bold text-white">{appName}</span>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
