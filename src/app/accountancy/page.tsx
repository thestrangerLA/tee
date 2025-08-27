
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, Wallet, PlusCircle, Calendar as CalendarIcon, ChevronDown, ChevronUp, TrendingUp, ArrowUpCircle, ArrowDownCircle, Minus, Equal, FileText, MoreHorizontal, Pencil } from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, getMonth, getYear, setMonth, startOfDay } from "date-fns"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { listenToTransactions, addTransaction, listenToAccountSummary, updateAccountSummary, deleteTransaction, updateTransaction } from '@/services/accountancyService';
import type { Transaction, AccountSummary } from '@/lib/types';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);
}

const SummaryCard = ({ title, value, icon, onClick }: { title: string, value: string, icon: React.ReactNode, onClick?: () => void }) => (
    <Card className={onClick ? 'cursor-pointer hover:bg-muted/80' : ''} onClick={onClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
               <CardTitle className="text-sm font-medium">{title}</CardTitle>
               {onClick && <Pencil className="h-3 w-3 text-muted-foreground" />}
            </div>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function AccountancyPage() {
    const { toast } = useToast();
    const [accountSummary, setAccountSummary] = useState<AccountSummary>({ id: 'latest', cash: 0, transfer: 0});
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: 0,
        description: '',
        paymentMethod: 'cash' as 'cash' | 'transfer'
    });
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isTransactionFormVisible, setTransactionFormVisible] = useState(true);
    const [isHistoryVisible, setHistoryVisible] = useState(true);
    const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | undefined>(new Date());
    
    const [historyDisplayMonth, setHistoryDisplayMonth] = useState<Date>(new Date());
    const [editingSummaryField, setEditingSummaryField] = useState<'cash' | 'transfer' | null>(null);
    const [editingSummaryValue, setEditingSummaryValue] = useState(0);

    useEffect(() => {
        const unsubscribeTransactions = listenToTransactions(setAllTransactions);
        const unsubscribeSummary = listenToAccountSummary((summary) => {
            if (summary) {
                setAccountSummary(summary);
            } else {
                 const initialSummary = { id: 'latest', cash: 0, transfer: 0 };
                setAccountSummary(initialSummary);
                updateAccountSummary(initialSummary);
            }
        });
        
        return () => {
            unsubscribeTransactions();
            unsubscribeSummary();
        };
    }, []);

    const totalMoney = useMemo(() => accountSummary.cash + accountSummary.transfer, [accountSummary]);
    
    const transactionDates = useMemo(() => {
       return allTransactions.map(tx => tx.date);
    }, [allTransactions]);
    
    const transactionsForSelectedDate = useMemo(() => {
        if (!selectedHistoryDate) return [];
        return allTransactions.filter(tx => isSameDay(tx.date, selectedHistoryDate));
    }, [allTransactions, selectedHistoryDate]);

    const dailySummary = useMemo(() => {
        return transactionsForSelectedDate.reduce((acc, tx) => {
            if (tx.type === 'income') {
                acc.income += tx.amount;
            } else {
                acc.expense += tx.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [transactionsForSelectedDate]);


    const performanceData = useMemo(() => {
        const calculateMonthlySummary = (month: Date) => {
            const start = startOfMonth(month);
            const end = endOfMonth(month);

            const monthlyTransactions = allTransactions.filter(tx => isWithinInterval(tx.date, { start, end }));
            
            const income = monthlyTransactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + tx.amount, 0);
                
            const expense = monthlyTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + tx.amount, 0);

            return { income, expense, netProfit: income - expense };
        };

        const currentMonthData = calculateMonthlySummary(historyDisplayMonth);
        const previousMonthData = calculateMonthlySummary(subMonths(historyDisplayMonth, 1));
        
        const broughtForward = previousMonthData.netProfit;
        const totalIncome = broughtForward + currentMonthData.income;
        const netProfit = totalIncome - currentMonthData.expense;

        return { 
            broughtForward, 
            income: currentMonthData.income, 
            totalIncome, 
            expense: currentMonthData.expense, 
            netProfit 
        };
    }, [allTransactions, historyDisplayMonth]);

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
        
        const newTxData = { date: startOfDay(date), ...newTransaction };

        try {
            await addTransaction(newTxData);

            const updatedSummary = { ...accountSummary };
            if (newTransaction.type === 'income') {
                updatedSummary[newTransaction.paymentMethod] += newTransaction.amount;
            } else {
                updatedSummary[newTransaction.paymentMethod] -= newTransaction.amount;
            }
            await updateAccountSummary(updatedSummary);
            
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
    
    const handleDeleteTransaction = async (txToDelete: Transaction) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${txToDelete.description || 'ไม่มีชื่อ'}"?`)) return;

        try {
            await deleteTransaction(txToDelete.id);
            
            const updatedSummary = { ...accountSummary };
             if (txToDelete.type === 'income') {
                updatedSummary[txToDelete.paymentMethod] -= txToDelete.amount;
            } else {
                updatedSummary[txToDelete.paymentMethod] += txToDelete.amount;
            }
            await updateAccountSummary(updatedSummary);

            toast({
                title: "ลบธุรกรรมสำเร็จ",
            });
        } catch (error) {
            console.error("Error deleting transaction: ", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบธุรกรรมได้",
                variant: "destructive",
            });
        }
    };
    
    const handleUpdateTransaction = async () => {
        if (!editingTransaction) return;

        const originalTx = allTransactions.find(tx => tx.id === editingTransaction.id);
        if (!originalTx) return;

        try {
            await updateTransaction(editingTransaction.id, {
                ...editingTransaction,
                date: startOfDay(editingTransaction.date),
            });

            const updatedSummary = { ...accountSummary };
            
            // 1. Revert the original transaction
            if (originalTx.type === 'income') {
                updatedSummary[originalTx.paymentMethod] -= originalTx.amount;
            } else {
                updatedSummary[originalTx.paymentMethod] += originalTx.amount;
            }

            // 2. Apply the updated transaction
            if (editingTransaction.type === 'income') {
                updatedSummary[editingTransaction.paymentMethod] += editingTransaction.amount;
            } else {
                updatedSummary[editingTransaction.paymentMethod] -= editingTransaction.amount;
            }

            await updateAccountSummary(updatedSummary);
            
            toast({
                title: "อัปเดตธุรกรรมสำเร็จ",
            });
            setEditingTransaction(null); // Close dialog
        } catch (error) {
            console.error("Error updating transaction: ", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถอัปเดตธุรกรรมได้",
                variant: "destructive",
            });
        }
    };


    const openEditDialog = (tx: Transaction) => {
        setEditingTransaction({ ...tx });
    };

     const openEditSummaryDialog = (field: 'cash' | 'transfer') => {
        setEditingSummaryField(field);
        setEditingSummaryValue(accountSummary[field]);
    };

    const handleUpdateSummaryField = async () => {
        if (!editingSummaryField) return;

        try {
            await updateAccountSummary({ [editingSummaryField]: editingSummaryValue });
            toast({
                title: "อัปเดตยอดเงินสำเร็จ",
            });
            setEditingSummaryField(null);
        } catch (error) {
            console.error("Error updating summary: ", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถอัปเดตยอดเงินได้",
                variant: "destructive",
            });
        }
    };

    const MonthYearSelector = () => {
        const currentYear = getYear(new Date());
        const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Current year and previous four years
        const months = Array.from({ length: 12 }, (_, i) => setMonth(new Date(), i));

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        {format(historyDisplayMonth, "LLLL yyyy", { locale: th })}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {years.map(year => (
                         <DropdownMenuSub key={year}>
                            <DropdownMenuSubTrigger>
                                <span>{year + 543}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {months.map(month => (
                                        <DropdownMenuItem 
                                            key={getMonth(month)} 
                                            onClick={() => {
                                                const newDate = new Date(year, getMonth(month), 1);
                                                setHistoryDisplayMonth(newDate);
                                            }}
                                        >
                                            {format(month, "LLLL", { locale: th })}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                             </DropdownMenuPortal>
                        </DropdownMenuSub>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

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
                     <SummaryCard title="เงินสด" value={formatCurrency(accountSummary.cash)} icon={<Wallet className="h-5 w-5 text-primary" />} onClick={() => openEditSummaryDialog('cash')} />
                     <SummaryCard title="เงินโอน" value={formatCurrency(accountSummary.transfer)} icon={<Landmark className="h-5 w-5 text-primary" />} onClick={() => openEditSummaryDialog('transfer')} />
                     <SummaryCard title="รวมเงินทั้งหมด" value={formatCurrency(totalMoney)} icon={<div className="font-bold text-2xl">💰</div>} />
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <CardTitle className="text-sm font-medium">กำไรสุทธิ</CardTitle>
                           <TrendingUp className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold">{formatCurrency(performanceData.netProfit)}</div>
                           <p className="text-xs text-muted-foreground">สำหรับเดือน {format(historyDisplayMonth, "LLLL yyyy", { locale: th })}</p>
                        </CardContent>
                     </Card>
                </div>

                 <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle>สรุปผลประกอบการ</CardTitle>
                            <CardDescription>สำหรับเดือน {format(historyDisplayMonth, "LLLL yyyy", { locale: th })}</CardDescription>
                        </div>
                        <MonthYearSelector />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="ยอดยกมา" value={formatCurrency(performanceData.broughtForward)} icon={<FileText className="h-5 w-5 text-primary" />} />
                        <SummaryCard title="รายรับ" value={formatCurrency(performanceData.income)} icon={<ArrowUpCircle className="h-5 w-5 text-green-500" />} />
                        <SummaryCard title="รายจ่าย" value={formatCurrency(performanceData.expense)} icon={<ArrowDownCircle className="h-5 w-5 text-red-500" />} />
                        <SummaryCard title="กำไรสุทธิ" value={formatCurrency(performanceData.netProfit)} icon={performanceData.netProfit >= 0 ? <Equal className="h-5 w-5 text-blue-500" /> : <Minus className="h-5 w-5 text-red-500" />} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <Card>
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
                    </div>

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
                            <div className="flex flex-col items-center gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="w-full md:w-[280px] justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedHistoryDate ? format(selectedHistoryDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
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
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex-1">
                                {transactionsForSelectedDate.length > 0 ? (
                                    <>
                                        <div className="flex justify-around p-2 mb-2 bg-muted rounded-md">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">รวมรับ</p>
                                                <p className="font-bold text-green-600">{formatCurrency(dailySummary.income)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">รวมจ่าย</p>
                                                <p className="font-bold text-red-600">{formatCurrency(dailySummary.expense)}</p>
                                            </div>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>คำอธิบาย</TableHead>
                                                    <TableHead>การชำระเงิน</TableHead>
                                                    <TableHead className="text-right">จำนวนเงิน</TableHead>
                                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {transactionsForSelectedDate.map((tx) => (
                                                <TableRow key={tx.id} className={tx.type === 'income' ? 'bg-green-50/50' : 'bg-red-50/50'}>
                                                    <TableCell>
                                                        <div className="font-medium">{tx.description || "-"}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{tx.paymentMethod === 'cash' ? 'เงินสด' : 'เงินโอน'}</Badge>
                                                    </TableCell>
                                                    <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(tx.amount)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => openEditDialog(tx)}>
                                                                    แก้ไข
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleDeleteTransaction(tx)}
                                                                >
                                                                    ลบ
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                        </Table>
                                    </>
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

            {editingTransaction && (
                 <Dialog open={!!editingTransaction} onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>แก้ไขธุรกรรม</DialogTitle>
                            <DialogDescription>
                                อัปเดตรายละเอียดธุรกรรมของคุณด้านล่าง
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-3">
                                <Label>ประเภทธุรกรรม</Label>
                                <RadioGroup
                                    value={editingTransaction.type}
                                    onValueChange={(value) => setEditingTransaction({ ...editingTransaction, type: value as 'income' | 'expense' })}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="income" id="edit-r-income" />
                                        <Label htmlFor="edit-r-income">รายรับ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="expense" id="edit-r-expense" />
                                        <Label htmlFor="edit-r-expense">รายจ่าย</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-date">วันที่</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editingTransaction.date ? format(editingTransaction.date, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={editingTransaction.date}
                                            onSelect={(d) => setEditingTransaction({ ...editingTransaction, date: d || new Date() })}
                                            initialFocus
                                            locale={th}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-amount">จำนวนเงิน (THB)</Label>
                                <Input id="edit-amount" type="number" value={editingTransaction.amount} onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: Number(e.target.value)})} required />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-description">คำอธิบาย</Label>
                                <Textarea id="edit-description" value={editingTransaction.description} onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value})} />
                            </div>
                             <div className="grid gap-3">
                                <Label>วิธีการชำระเงิน</Label>
                                <RadioGroup
                                    value={editingTransaction.paymentMethod}
                                    onValueChange={(value) => setEditingTransaction({ ...editingTransaction, paymentMethod: value as 'cash' | 'transfer' })}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="cash" id="edit-r-cash" />
                                        <Label htmlFor="edit-r-cash">เงินสด</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="transfer" id="edit-r-transfer" />
                                        <Label htmlFor="edit-r-transfer">เงินโอน</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingTransaction(null)}>ยกเลิก</Button>
                            <Button onClick={handleUpdateTransaction}>บันทึกการเปลี่ยนแปลง</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {editingSummaryField && (
                 <Dialog open={!!editingSummaryField} onOpenChange={(isOpen) => !isOpen && setEditingSummaryField(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>แก้ไขยอด {editingSummaryField === 'cash' ? 'เงินสด' : 'เงินโอน'}</DialogTitle>
                             <DialogDescription>
                                ป้อนยอดเงินปัจจุบัน
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-3">
                                 <Label htmlFor="edit-summary-amount">จำนวนเงิน (THB)</Label>
                                <Input 
                                    id="edit-summary-amount" 
                                    type="number" 
                                    value={editingSummaryValue} 
                                    onChange={(e) => setEditingSummaryValue(Number(e.target.value))} 
                                    required 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingSummaryField(null)}>ยกเลิก</Button>
                            <Button onClick={handleUpdateSummaryField}>บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );

    