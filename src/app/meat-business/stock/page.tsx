
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package } from "lucide-react"
import Link from 'next/link'

export default function MeatStockPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/meat-business">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຈັດການສະຕັອກ (ທຸລະກິດຊີ້ນ)</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Management Dashboard</CardTitle>
                        <CardDescription>This section is under construction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The stock management features for the meat business will be implemented here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
