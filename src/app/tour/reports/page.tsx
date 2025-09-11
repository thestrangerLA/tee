
"use client"

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePieChart, BookOpen, ChevronRight } from "lucide-react";


export default function TourReportsPage() {

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
                    <FilePieChart className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">สรุปยอดธุรกิจทัวร์</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 md:gap-8 max-w-4xl mx-auto w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>เลือกรายงาน</CardTitle>
                        <CardDescription>เลือกประเภทรายงานที่ต้องการดู</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/tour/reports/program-summary">
                            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className='flex items-center gap-4'>
                                        <div className="bg-primary/10 p-3 rounded-full">
                                          <FilePieChart className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">สรุปผลประกอบการรายโปรแกรม</CardTitle>
                                            <CardDescription>ดูภาพรวมกำไร-ขาดทุนของแต่ละโปรแกรมทัวร์</CardDescription>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                            </Card>
                        </Link>
                         <Link href="/tour/reports/general-ledger">
                            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className='flex items-center gap-4'>
                                         <div className="bg-primary/10 p-3 rounded-full">
                                          <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">ประวัติรับ-จ่ายทั่วไป</CardTitle>
                                            <CardDescription>ดูรายการธุรกรรมที่ไม่ผูกกับโปรแกรมทัวร์</CardDescription>
                                        </div>
                                    </div>
                                     <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                            </Card>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

