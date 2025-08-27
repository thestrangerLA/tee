
"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Briefcase, ArrowLeft, TrendingUp, TrendingDown, DollarSign, PlusCircle, Calendar as CalendarIcon, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import * as React from "react"

const SummaryCard = ({ title, value, valueColor }: { title: string; value: string; valueColor?: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </CardContent>
  </Card>
);

const CashSummaryCard = ({ title, value }: { title: string; value: string }) => (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
         <div className="h-2 mt-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
      </CardContent>
    </Card>
);

function TransactionFormContent() {
    const [date, setDate] = React.useState<Date>()

     return (
        <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">จำนวนเงิน</Label>
                    <Input id="amount" placeholder="KIP 0.00" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Input id="category" placeholder="เช่น ซอฟต์แวร์, อาหาร, ฟรีแลนซ์" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea id="description" placeholder="อธิบายรายการ" />
            </div>
             <div className="space-y-2">
                <Label>วิธีการชำระเงิน</Label>
                 <RadioGroup defaultValue="cash" className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">เงินสด</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer">เงินโอน</Label>
                    </div>
                </RadioGroup>
            </div>
            <Button variant="outline" className="w-full">
                <Wand2 className="mr-2 h-4 w-4" />
                แนะนำประเภทและหมวดหมู่
            </Button>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                เพิ่มธุรกรรม
            </Button>
        </div>
     );
}

function AddTransactionForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>เพิ่มธุรกรรม</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="income">รายรับ</TabsTrigger>
                        <TabsTrigger value="expense">รายจ่าย</TabsTrigger>
                    </TabsList>
                    <TabsContent value="income">
                        <TransactionFormContent />
                    </TabsContent>
                     <TabsContent value="expense">
                        <TransactionFormContent />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

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
        <div className="flex justify-end">
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="สิงหาคม 2025" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="aug-2025">สิงหาคม 2025</SelectItem>
                    <SelectItem value="jul-2025">กรกฎาคม 2025</SelectItem>
                    <SelectItem value="jun-2025">มิถุนายน 2025</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <CashSummaryCard title="เงินสด" value="0" />
            <CashSummaryCard title="เงินโอน" value="0" />
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">รวมเงิน</p>
                    <p className="text-2xl font-bold">0</p>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ผลประกอบการ (สิงหาคม 2025)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <SummaryCard title="ยอดยกมา" value="0" />
            <SummaryCard title="รายรับ" value="0" valueColor="text-green-600" />
            <SummaryCard title="รวม" value="0" />
            <SummaryCard title="รายจ่าย" value="0" valueColor="text-red-600" />
            <SummaryCard title="กำไรสุทธิ" value="0" valueColor="text-green-600" />
          </CardContent>
        </Card>
        
        <AddTransactionForm />

         <Card className="w-full">
          <CardHeader>
            <CardTitle>รายงานสรุป</CardTitle>
             <CardDescription>
              ฟังก์ชันการทำงานสำหรับส่วนรายงานกำลังอยู่ในระหว่างการพัฒนา
            </CardDescription>
          </Header>
          <CardContent>
            <p className="text-muted-foreground">
              เร็วๆ นี้คุณจะสามารถดูรายงานรายรับ-รายจ่าย, รายงานสินค้าคงคลัง, และรายงานภาษีได้ที่นี่
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
