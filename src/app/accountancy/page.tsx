
"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, Wallet, Plus, Save, PlusCircle, Calendar as CalendarIcon } from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { th } from "date-fns/locale"

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
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        paymentMethod: 'cash'
    });

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
            title: "เพิ่มธุรกรรมใหม่สำเร็จ",
            description: `เพิ่มรายการ ${newTransaction.category} จำนวน ${formatCurrency(newTransaction.amount)}`,
        });
        // Reset form
        setNewTransaction({ type: 'expense', amount: 0, category: '', description: '', paymentMethod: 'cash' });
        setDate(new Date());
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
                        <CardDescription>บันทึกรายรับ-รายจ่ายใหม่ของคุณ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddTransaction}>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label>ประเภทธุรกรรม</Label>
                                    <RadioGroup
                                        value={newTransaction.type}
                                        onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="income" id="r-income" />
                                            <Label htmlFor="r-income">รายรับ</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="expense" id="r-expense" />
                                            <Label htmlFor="r-expense">รายจ่าย</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="date">วันที่</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-[280px] justify-start text-left font-normal"
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
                                
                                <div className="grid gap-3">
                                    <Label htmlFor="amount">จำนวนเงิน (KIP)</Label>
                                    <Input id="amount" type="number" placeholder="0.00" value={newTransaction.amount || ''} onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value)})} required />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="category">หมวดหมู่</Label>
                                    <Input id="category" placeholder="เช่น ค่าปุ๋ย, ขายข้าว" value={newTransaction.category} onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value})} required />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea id="description" placeholder="อธิบายรายการ (ถ้ามี)" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value})} />
                                </div>

                                <div className="grid gap-3">
                                    <Label>วิธีการชำระเงิน</Label>
                                    <RadioGroup
                                        value={newTransaction.paymentMethod}
                                        onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMethod: value })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="cash" id="r-cash" />
                                            <Label htmlFor="r-cash">เงินสด</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="transfer" id="r-transfer" />
                                            <Label htmlFor="r-transfer">เงินโอน</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Button type="submit" className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    เพิ่มธุรกรรม
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

    