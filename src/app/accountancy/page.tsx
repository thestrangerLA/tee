
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, Wallet, Plus, Save, PlusCircle, Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { format, getYear, setMonth, setYear, startOfDay } from "date-fns"
import { th } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listenToTransactions, addTransaction, listenToAccountSummary, updateAccountSummary } from '@/services/accountancyService';
import type { Transaction } from '@/lib/types';


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
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: 0,
        description: '',
        paymentMethod: 'cash' as 'cash' | 'transfer'
    });
    const [isTransactionFormVisible, setTransactionFormVisible] = useState(false);
    const [isHistoryVisible, setHistoryVisible] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

    useEffect(() => {
        const unsubscribeTransactions = listenToTransactions(setAllTransactions);
        const unsubscribeSummary = listenToAccountSummary((summary) => {
            if (summary) {
                setCash(summary.cash);
                setTransfer(summary.transfer);
            }
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeSummary();
        };
    }, []);

    const totalMoney = useMemo(() => cash + transfer, [cash, transfer]);
    
    const availableMonths = useMemo(() => {
        const months = new Set(allTransactions.map(tx => format(tx.date, 'yyyy-MM')));
        const currentYear = getYear(new Date());
        for (let i = 0; i < 12; i++) {
            const monthDate = setMonth(new Date(), i);
            const yearMonth = format(setYear(monthDate, currentYear), 'yyyy-MM');
            months.add(yearMonth);
        }
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [allTransactions]);
    
    const filteredTransactionsByMonth = useMemo(() => {
        return allTransactions.filter(tx => format(tx.date, 'yyyy-MM') === selectedMonth);
    }, [allTransactions, selectedMonth]);

    const groupedTransactionsByDate = useMemo(() => {
        return filteredTransactionsByMonth.reduce((acc, tx) => {
            const dateKey = format(startOfDay(tx.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);
    }, [filteredTransactionsByMonth]);

    const handleSave = async () => {
        try {
            await updateAccountSummary({ cash, transfer });
            toast({
                title: "สำเร็จ!",
                description: `บันทึกยอดเงินสดและเงินโอนเรียบร้อยแล้ว`,
            });
        } catch (error) {
            console.error("Error saving account summary: ", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกยอดเงินได้",
                variant: "destructive",
            });
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) {
            toast({
                title: "ข้อผิดพลาด",
                description: "กรุณาเลือกวันที่",
                variant: "destructive",
            });
            return;
        }
        
        const newTxData = { date, ...newTransaction };

        try {
            await addTransaction(newTxData);
            
            const balanceToUpdate = newTransaction.paymentMethod === 'cash' ? cash : transfer;
            const updatedBalance = newTransaction.type === 'income' 
                ? balanceToUpdate + newTransaction.amount 
                : balanceToUpdate - newTransaction.amount;
    
            if (newTransaction.paymentMethod === 'cash') {
                setCash(updatedBalance);
            } else {
                setTransfer(updatedBalance);
            }

            toast({
                title: "เพิ่มธุรกรรมใหม่สำเร็จ",
                description: `เพิ่มรายการใหม่จำนวน ${formatCurrency(newTransaction.amount)}`,
            });
    
            setNewTransaction({ type: 'expense', amount: 0, description: '', paymentMethod: 'cash' });
            setDate(new Date());

        } catch (error) {
             console.error("Error adding transaction: ", error);
             toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถเพิ่มธุรกรรมได้",
                variant: "destructive",
            });
        }
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

                <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>เพิ่มธุรกรรม</CardTitle>
                                    <CardDescription>บันทึกรายรับ-รายจ่ายใหม่ของคุณ</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setTransactionFormVisible(!isTransactionFormVisible)}>
                                    {isTransactionFormVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    <span className="sr-only">Toggle form</span>
                                </Button>
                            </div>
                        </CardHeader>
                        {isTransactionFormVisible && (
                        <CardContent>
                            <form onSubmit={handleAddTransaction}>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label>ประเภทธุรกรรม</Label>
                                        <RadioGroup
                                            value={newTransaction.type}
                                            onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as 'income' | 'expense' })}
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
                                    
                                    <div className="grid gap-3">
                                        <Label htmlFor="amount">จำนวนเงิน (KIP)</Label>
                                        <Input id="amount" type="number" placeholder="0.00" value={newTransaction.amount || ''} onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value)})} required />
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="description">คำอธิบาย</Label>
                                        <Textarea id="description" placeholder="อธิบายรายการ (ถ้ามี)" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value})} />
                                    </div>

                                    <div className="grid gap-3">
                                        <Label>วิธีการชำระเงิน</Label>
                                        <RadioGroup
                                            value={newTransaction.paymentMethod}
                                            onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMethod: value as 'cash' | 'transfer' })}
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
                        )}
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>ประวัติธุรกรรม</CardTitle>
                                    <CardDescription>รายการรายรับ-รายจ่ายล่าสุดของคุณ</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-[200px]">
                                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกเดือน" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableMonths.map(month => {
                                                    const [year, monthNum] = month.split('-').map(Number);
                                                    const dateObj = setYear(setMonth(new Date(), monthNum - 1), year);
                                                    return (
                                                        <SelectItem key={month} value={month}>
                                                            {format(dateObj, "LLLL yyyy", { locale: th })}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setHistoryVisible(!isHistoryVisible)}>
                                        {isHistoryVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        <span className="sr-only">Toggle History</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {isHistoryVisible && (
                        <CardContent>
                             {Object.keys(groupedTransactionsByDate).length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {Object.entries(groupedTransactionsByDate).map(([dateKey, transactions]) => {
                                        const dateObject = new Date(dateKey);
                                        // Manually adjust for timezone offset to prevent date shifts
                                        const correctedDate = new Date(dateObject.valueOf() + dateObject.getTimezoneOffset() * 60 * 1000);

                                        return (
                                        <AccordionItem value={dateKey} key={dateKey}>
                                            <AccordionTrigger>{format(correctedDate, "EEEE, dd MMMM yyyy", { locale: th })}</AccordionTrigger>
                                            <AccordionContent>
                                                 <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>คำอธิบาย</TableHead>
                                                            <TableHead>ประเภท</TableHead>
                                                            <TableHead>การชำระเงิน</TableHead>
                                                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                    {transactions.map((tx) => (
                                                        <TableRow key={tx.id}>
                                                            <TableCell>
                                                                <div className="font-medium">{tx.description || "-"}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={tx.type === 'income' ? 'secondary' : 'destructive'}>
                                                                    {tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{tx.paymentMethod === 'cash' ? 'เงินสด' : 'เงินโอน'}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    </TableBody>
                                                </Table>
                                            </AccordionContent>
                                        </AccordionItem>
                                        )}
                                    )}
                                </Accordion>
                             ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    ยังไม่มีธุรกรรมในเดือนนี้
                                </div>
                             )}
                        </CardContent>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}


    