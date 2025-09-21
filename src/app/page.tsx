
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, FerrisWheel, Calculator, FileText, HelpCircle } from "lucide-react"
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">ແອັບພລິເຄຊັນທຸລະກິດ</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          <Link href="/tour">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ທຸລະກິດທ່ອງທ່ຽວ</CardTitle>
                <FerrisWheel className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ຈັດການຂໍ້ມູນ ແລະ ໂປຣແກຣມທົວ
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/agriculture/login">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ທຸລະກິດກະສິກຳ</CardTitle>
                <Leaf className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ຈັດການສະຕັອກ, ບັນຊີ, ແລະ ຂໍ້ມູນອື່ນໆ
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/tour/calculator">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ຄຳນວນຕົ້ນທຶນ</CardTitle>
                <Calculator className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ເຄື່ອງມືຄຳນວນຄ່າໃຊ້ຈ່າຍ ແລະ ລາຄາສຳລັບໂປຣແກຣມທົວ
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/documents">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ທຸລະກິດ ເອກະສານ</CardTitle>
                <FileText className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ຈັດການຂໍ້ມູນເອກະສານ ແລະ ວີຊ່າ
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
