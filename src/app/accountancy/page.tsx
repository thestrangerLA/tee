
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, Wallet, PlusCircle, Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { format, getYear, setMonth, setYear, startOfDay, isSameDay } from "date-fns"
import { th } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listenToTransactions, addTransaction } from '@/services/accountancyService';
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
    const [isTransactionFormVisible, setTransactionFormVisible] = useState(true);
    const [isHistoryVisible, setHistoryVisible] = useState(true);
    const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | undefined>(new Date());
    
    // This state will hold the month displayed in the history calendar
    const [historyDisplayMonth, setHistoryDisplayMonth] = useState<Date>(new Date());

    useEffect(() => {
        const unsubscribeTransactions = listenToTransactions(setAllTransactions);
        // Mock account summary for now, or implement listenToAccountSummary
        // For simplicity, we'll manage cash/transfer in local state
        return () => {
            unsubscribeTransactions();
        };
    }, []);

    const totalMoney = useMemo(() => cash + transfer, [cash, transfer]);
    
    const transactionDates = useMemo(() => {
       return allTransactions.map(tx => startOfDay(tx.date));
    }, [allTransactions]);
    
    const transactionsForSelectedDate = useMemo(() => {
        if (!selectedHistoryDate) return [];
        return allTransactions.filter(tx => isSameDay(tx.date, selectedHistoryDate));
    }, [allTransactions, selectedHistoryDate]);


    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !newTransaction.amount) {
            toast({
                title: "ข้อผิดพลาด",
                description: "กรุณากรอกวันที่และจำนวนเงิน",
                variant: "destructive",
            });
            return;
        }
        
        const newTxData = { date, ...newTransaction };

        try {
            await addTransaction(newTxData);
            
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
                     <SummaryCard title="เงินสด" value={formatCurrency(cash)} icon={<Wallet className="h-5 w-5 text-primary" />} />
                     <SummaryCard title="เงินโอน" value={formatCurrency(transfer)} icon={<Landmark className="h-5 w-5 text-primary" />} />
                     <SummaryCard title="รวมเงินทั้งหมด" value={formatCurrency(totalMoney)} icon={<div className="font-bold text-2xl">💰</div>} />
                </div>

                <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setTransactionFormVisible(!isTransactionFormVisible)}>
                                <div>
                                    <CardTitle>เพิ่มธุรกรรม</CardTitle>
                                    <CardDescription>บันทึกรายรับ-รายจ่ายใหม่ของคุณ</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon">
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
                                                    locale={th}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        <Label htmlFor="amount">จำนวนเงิน (THB)</Label>
                                        <Input id="amount" type="number" placeholder="0.00" value={newTransaction.amount || ''} onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value)})} required />
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="description">คำอธิบาย</Label>
                                        <Textarea id="description" placeholder="อธิบายรายการ" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value})} />
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
                             <div className="flex justify-between items-center cursor-pointer" onClick={() => setHistoryVisible(!isHistoryVisible)}>
                                <div>
                                    <CardTitle>ประวัติธุรกรรม</CardTitle>
                                    <CardDescription>
                                        {selectedHistoryDate ? `ธุรกรรมวันที่ ${format(selectedHistoryDate, "dd MMMM yyyy", { locale: th })}` : 'เลือกวันที่จากปฏิทินเพื่อดูธุรกรรม'}
                                    </CardDescription>
                                </div>
                                 <Button variant="ghost" size="icon">
                                    {isHistoryVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    <span className="sr-only">Toggle History</span>
                                </Button>
                            </div>
                        </CardHeader>
                        {isHistoryVisible && (
                        <CardContent className="flex flex-col md:flex-row gap-4">
                            <div className="flex justify-center">
                                 <Calendar
                                    mode="single"
                                    selected={selectedHistoryDate}
                                    onSelect={setSelectedHistoryDate}
                                    month={historyDisplayMonth}
                                    onMonthChange={setHistoryDisplayMonth}
                                    locale={th}
                                    modifiers={{ haveTransactions: transactionDates }}
                                    modifiersClassNames={{
                                        haveTransactions: 'bg-primary/20 rounded-full',
                                    }}
                                    className="rounded-md border"
                                />
                            </div>
                            <div className="flex-1">
                                {transactionsForSelectedDate.length > 0 ? (
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
                                        {transactionsForSelectedDate.map((tx) => (
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
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        {selectedHistoryDate ? 'ไม่มีธุรกรรมในวันที่เลือก' : 'กรุณาเลือกวัน'}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}

    