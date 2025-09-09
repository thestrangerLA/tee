
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"


export default function TourProgramsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/tour">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">กลับไปหน้าหลัก</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">โปรแกรมทัวร์</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>จัดการโปรแกรมทัวร์</CardTitle>
                <CardDescription>
                    ส่วนนี้สำหรับสร้าง, แก้ไข, และจัดการโปรแกรมทัวร์ทั้งหมดของคุณ
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    <p>(เนื้อหาสำหรับจัดการโปรแกรมทัวร์จะถูกสร้างที่นี่)</p>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
