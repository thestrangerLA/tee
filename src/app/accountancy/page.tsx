
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>เร็วๆ นี้</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ฟังก์ชันการทำงานสำหรับส่วนการบัญชีกำลังอยู่ในระหว่างการพัฒนา
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
