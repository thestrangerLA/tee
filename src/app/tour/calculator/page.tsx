
"use client"

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";


export default function TourCalculatorPage() {

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้าแดชบอร์ด</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">เครื่องมือคำนวณ (ธุรกิจทัวร์)</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>เครื่องมือคำนวณ</CardTitle>
                        <CardDescription>
                            ส่วนนี้สำหรับเครื่องมือคำนวณค่าใช้จ่ายและราคาโปรแกรมทัวร์ จะถูกพัฒนาในลำดับถัดไป
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted-foreground">
                            <p className="text-muted-foreground">Coming Soon</p>
                        </div>
                    </CardContent>
                 </Card>
            </main>
        </div>
    );
}
