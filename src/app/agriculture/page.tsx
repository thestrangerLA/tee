
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Package, Calculator, Truck, Users, Landmark, BarChart, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"


export default function AgriculturePage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const isAuthenticated = sessionStorage.getItem('agriculture-auth');
        if (!isAuthenticated) {
            router.replace('/agriculture/login');
        }
    }, [router]);

    if (!isMounted) {
        return null; 
    }


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
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">ແດຊ໌ບອດທຸລະກິດກະສິກຳ</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          <Link href="/stock">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ผู้จัดการสต็อกสินค้าเกษตร</CardTitle>
                <Package className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  จัดการสต็อกสินค้าเกษตรทั้งหมดของคุณ, ติดตามระดับสต็อก, และจัดการราคา
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/agriculture/accountancy">
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
           <Link href="/transport">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">บัญชีขนส่ง</CardTitle>
                <Truck className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  บันทึกและติดตามค่าใช้จ่ายในการขนส่งสินค้าแต่ละประเภท
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/debtors">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ลูกหนี้/เจ้าหนี้ทั่วไป</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  จัดการและติดตามรายการลูกหนี้และเจ้าหนี้ทั่วไป
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/drug-creditors">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">ลูกหนี้ค่ายา</CardTitle>
                <Users className="h-8 w-8 text-rose-500" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  จัดการและติดตามรายการลูกหนี้ค่ายาโดยเฉพาะ
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tax">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">คำนวณภาษี</CardTitle>
                <Calculator className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  คำนวณภาษีเงินได้บุคคลธรรมดาตามอัตราก้าวหน้า
                </p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">สรุปยอดรายปี/รายเดือน</CardTitle>
                <BarChart className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ดูสรุปรายรับ-รายจ่าย และกำไรสุทธิแบบรายเดือนและรายปี
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
