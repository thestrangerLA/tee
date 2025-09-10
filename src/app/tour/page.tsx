
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Landmark, Users, BarChart, FileText, Briefcase, FilePieChart } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"


export default function TourPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">กลับไปหน้าหลัก</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">แดชบอร์ดธุรกิจทัวร์</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          <Link href="/tour/accountancy">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">จัดการบัญชี</CardTitle>
                <Landmark className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ติดตามรายรับ-รายจ่าย, จัดการธุรกรรม, และดูสรุปภาพรวมการเงิน
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/tour-programs">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">โปรแกรมทัวร์</CardTitle>
                <FileText className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  จัดการ สร้าง และแก้ไขโปรแกรมทัวร์สำหรับลูกค้า
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/debtors">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ลูกหนี้-เจ้าหนี้</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  จัดการและติดตามรายการลูกหนี้และเจ้าหนี้ที่เกี่ยวข้องกับทัวร์
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/tour/reports">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">สรุปยอด</CardTitle>
                <FilePieChart className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ดูสรุปผลประกอบการและกำไร-ขาดทุนของแต่ละโปรแกรมทัวร์
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
