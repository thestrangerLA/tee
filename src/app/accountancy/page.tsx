
"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, Wallet, Plus, Save } from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);
}

const SummaryCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function AccountancyPage() {
    const { toast } = useToast();
    const [cash, setCash] = useState<number>(0);
    const [transfer, setTransfer] = useState<number>(0);
    const [newTransaction, setNewTransaction] = useState({ description: '', amount: 0, type: 'expense' });

    const totalMoney = useMemo(() => cash + transfer, [cash, transfer]);

    const handleSave = () => {
        // Here you would typically save the data to a backend or state management
        toast({
            title: "สำเร็จ!",
            description: `บันทึกยอดเงินสดและเงินโอนเรียบร้อยแล้ว`,
        });
    };

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic to add transaction
        toast({
            title: "เพิ่มธุรกรรมใหม่",
            description: `${newTransaction.description}: ${formatCurrency(newTransaction.amount)} (${newTransaction.type})`,
        });
        setNewTransaction({ description: '', amount: 0, type: 'expense' });
    }

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
                    <h1 className="text-xl font-bold tracking-tight">จัดการบัญชี</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                <span>เงินสด</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="cash-input">จำนวนเงินสด (บาท)</Label>
                            <Input
                                id="cash-input"
                                type="number"
                                placeholder="กรอกจำนวนเงินสด"
                                value={cash || ''}
                                onChange={(e) => setCash(Number(e.target.value))}
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-primary" />
                                <span>เงินโอน</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Label htmlFor="transfer-input">จำนวนเงินโอน (บาท)</Label>
                            <Input
                                id="transfer-input"
                                type="number"
                                placeholder="กรอกจำนวนเงินโอน"
                                value={transfer || ''}
                                onChange={(e) => setTransfer(Number(e.target.value))}
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>
                    <SummaryCard title="รวมเงินทั้งหมด" value={formatCurrency(totalMoney)} icon={<div className="font-bold text-2xl">💰</div>} />
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>บันทึกยอด</CardTitle>
                             <CardDescription>บันทึกยอดเงินสดและเงินโอนปัจจุบัน</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleSave} className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                บันทึกข้อมูล
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>เพิ่มธุรกรรม</CardTitle>
                        <CardDescription>บันทึกรายรับ-รายจ่ายใหม่</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddTransaction} className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="description">รายการ</Label>
                                <Input id="description" placeholder="เช่น ค่าปุ๋ย" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="amount">จำนวนเงิน</Label>
                                <Input id="amount" type="number" placeholder="0" value={newTransaction.amount || ''} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} required/>
                            </div>
                            <div className="flex items-end">
                                 <Button type="submit" className="w-full">
                                    <Plus className="mr-2 h-4 w-4"/>
                                    เพิ่มรายการ
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
