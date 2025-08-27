
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Briefcase, ArrowLeft, TrendingUp, TrendingDown, DollarSign, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"

export default function AccountancyPage() {
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
            <h1 className="text-xl font-bold tracking-tight font-headline">การบัญชี</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard 
                title="ยอดขาย (เดือนนี้)"
                value="0 กีบ"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                description="ยอดขายรวมในเดือนปัจจุบัน"
            />
            <StatCard
                title="ค่าใช้จ่าย (เดือนนี้)"
                value="0 กีบ"
                icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
                description="ค่าใช้จ่ายรวมในเดือนปัจจุบัน"
            />
             <StatCard 
                title="กำไรสุทธิ (เดือนนี้)"
                value="0 กีบ"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="กำไรหลังหักค่าใช้จ่าย"
            />
             <StatCard 
                title="ภาษีคาดการณ์ (เดือนนี้)"
                value="0 กีบ"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="ภาษีที่คาดว่าจะต้องชำระ"
            />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>ธุรกรรมด่วน</CardTitle>
                <CardDescription>บันทึกรายรับและรายจ่ายอย่างรวดเร็ว</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    บันทึกการขาย
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    บันทึกค่าใช้จ่าย
                </Button>
            </CardContent>
        </Card>
         <Card className="w-full">
          <CardHeader>
            <CardTitle>รายงานสรุป</CardTitle>
             <CardDescription>
              ฟังก์ชันการทำงานสำหรับส่วนรายงานกำลังอยู่ในระหว่างการพัฒนา
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              เร็วๆ นี้คุณจะสามารถดูรายงานรายรับ-รายจ่าย, รายงานสินค้าคงคลัง, และรายงานภาษีได้ที่นี่
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
