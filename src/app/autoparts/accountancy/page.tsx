
"use client"

// This is a placeholder for the Auto Parts Accountancy page.
// It can be implemented similar to the Agriculture Accountancy page.

import { ArrowLeft, Construction } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AutoPartsAccountancyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/autoparts">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">ຈັດການບັນຊີ (ທຸລະກິດອາໄຫຼລົດ)</h1>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="items-center">
            <Construction className="h-16 w-16 text-yellow-500" />
            <CardTitle className="text-2xl">Under Construction</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>ໜ้านີ້ກຳລັງຢູ່ໃນການພັດທະນາ. ຈະມີການເພີ່ມເຕີມໃນໄວໆນີ້</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
