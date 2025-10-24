
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart, Landmark, Package, FilePieChart, FileText } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"


export default function AppliancesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">ແດຊ໌ບອດທຸລະກິດເຄື່ອງໃຊ້</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          <Link href="/appliances/invoice">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ອອກໃບເກັບເງິນ</CardTitle>
                <FileText className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ສ້າງ ແລະ ພິມໃບເກັບເງິນສຳລັບລູກຄ້າ
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/appliances/stock">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ຈັດການສະຕັອກ</CardTitle>
                <Package className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ຈັດການສະຕັອກສິນຄ້າ และ ຕິດຕາມລະດັບສະຕັອກ
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="#">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full text-muted-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ຈັດການບັນຊີ</CardTitle>
                <Landmark className="h-8 w-8 text-muted" />
              </CardHeader>
              <CardContent>
                <p>
                  ຕິດຕາມລາຍຮັບ-ລາຍຈ່າຍ (ຈະມາໃນໄວໆນີ້)
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="#">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full text-muted-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ສະຫຼຸບຍອດ</CardTitle>
                <FilePieChart className="h-8 w-8 text-muted" />
              </CardHeader>
              <CardContent>
                <p>
                  ເບິ່ງສະຫຼຸບຜົນປະກອບການ (ຈະມາໃນໄວໆນີ້)
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
