
"use client"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Trash2, PlusCircle, Calendar as CalendarIcon, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
    listenToTourCostItemsForProgram, 
    addTourCostItem, 
    updateTourCostItem, 
    deleteTourCostItem, 
    getTourProgram,
    listenToTourIncomeItemsForProgram,
    addTourIncomeItem,
    updateTourIncomeItem,
    deleteTourIncomeItem,
    updateTourProgram
} from '@/services/tourProgramService';
import type { TourCostItem, TourIncomeItem, TourProgram } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formatCurrency = (value: number | null | undefined, includeSymbol = false) => {
    if (value === null || value === undefined || isNaN(value)) return includeSymbol ? '0' : '';
    const formatted = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
    return formatted;
};

const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, '')) || 0;
};

const CurrencyEntryTable = ({ 
    items, 
    onAddItem,
    onUpdateItem,
    onDeleteItem,
    title,
    description
}: { 
    items: (TourCostItem[] | TourIncomeItem[]),
    onAddItem: () => Promise<void>,
    onUpdateItem: (id: string, field: keyof (TourCostItem | TourIncomeItem), value: any) => Promise<void>,
    onDeleteItem: (id: string) => Promise<void>,
    title: string,
    description: string,
}) => {
    
    const totals = useMemo(() => {
        return (items as Array<TourCostItem | TourIncomeItem>).reduce((acc, item) => {
            acc.kip += item.kip || 0;
            acc.baht += item.baht || 0;
            acc.usd += item.usd || 0;
            acc.cny += item.cny || 0;
            return acc;
        }, { kip: 0, baht: 0, usd: 0, cny: 0 });
    }, [items]);

    return (
        <Card className="print:hidden">
            <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                 <Button size="sm" onClick={onAddItem}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    เพิ่มรายการ
                </Button>
            </CardHeader>
             <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">ວັນທີ (Date)</TableHead>
                                <TableHead>ລາຍລະອຽດ (Description)</TableHead>
                                <TableHead className="text-right">KIP</TableHead>
                                <TableHead className="text-right">BAHT</TableHead>
                                <TableHead className="text-right">USD</TableHead>
                                <TableHead className="text-right">CNY</TableHead>
                                <TableHead className="w-[50px]"><span className="sr-only">ลบ</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(items as Array<TourCostItem | TourIncomeItem>).map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="p-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal h-8 text-xs">
                                                     <CalendarIcon className="mr-1 h-3 w-3" />
                                                    {item.date ? format(item.date, "dd/MM/yy") : <span>เลือกวันที่</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={item.date || undefined}
                                                    onSelect={(date) => onUpdateItem(item.id, 'date', date || new Date())}
                                                    initialFocus
                                                    locale={th}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input 
                                            defaultValue={item.detail || ''} 
                                            onBlur={(e) => onUpdateItem(item.id, 'detail', e.target.value)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.kip)}
                                            onBlur={(e) => onUpdateItem(item.id, 'kip', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.baht)}
                                            onBlur={(e) => onUpdateItem(item.id, 'baht', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.usd)}
                                            onBlur={(e) => onUpdateItem(item.id, 'usd', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.cny)}
                                            onBlur={(e) => onUpdateItem(item.id, 'cny', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1 text-center">
                                        <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted font-bold">
                                <TableCell colSpan={2} className="text-right">ລວມ (Total)</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.kip)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.baht)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.usd)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.cny)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

const SummaryCard = ({ title, value, currency, isProfit = false }: { title: string; value: number; currency: string; isProfit?: boolean }) => {
    const profitColor = value >= 0 ? 'text-green-600' : 'text-red-600';
    return (
        <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2 print:p-2">
                <CardTitle className="text-base print:text-sm">{title}</CardTitle>
                <CardDescription className="print:text-xs">{currency}</CardDescription>
            </CardHeader>
            <CardContent className="print:p-2">
                <p className={`text-2xl font-bold print:text-lg ${isProfit ? profitColor : ''}`}>{formatCurrency(value, true)}</p>
            </CardContent>
        </Card>
    );
};


export default function TourProgramDetailPage({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const [program, setProgram] = useState<TourProgram | null>(null);
    const [costItems, setCostItems] = useState<TourCostItem[]>([]);
    const [incomeItems, setIncomeItems] = useState<TourIncomeItem[]>([]);

    useEffect(() => {
        if (!params.id) return;
        const programId = params.id;

        const fetchProgram = async () => {
            const programData = await getTourProgram(programId);
            setProgram(programData);
        };

        fetchProgram();
        const unsubscribeCosts = listenToTourCostItemsForProgram(programId, setCostItems);
        const unsubscribeIncomes = listenToTourIncomeItemsForProgram(programId, setIncomeItems);
        
        return () => {
            unsubscribeCosts();
            unsubscribeIncomes();
        };
    }, [params.id]);
    
     useEffect(() => {
        if (program) {
            const price = program.price || 0;
            const bankCharge = program.bankCharge || 0;
            const newTotalPrice = price + bankCharge;
            if (newTotalPrice !== program.totalPrice) {
                setProgram(p => p ? { ...p, totalPrice: newTotalPrice } : null);
            }
        }
    }, [program?.price, program?.bankCharge]);

    // --- Cost Item Handlers ---
    const handleAddCostItem = async () => {
        try {
            await addTourCostItem(params.id);
        } catch (error) { toast({ title: "เกิดข้อผิดพลาดในการเพิ่มต้นทุน", variant: "destructive" }); }
    };
     const handleUpdateCostItem = async (id: string, field: keyof TourCostItem, value: any) => {
        try { await updateTourCostItem(id, { [field]: value }); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการอัปเดตต้นทุน", variant: "destructive" }); }
    };
    const handleDeleteCostItem = async (id: string) => {
        if (!window.confirm("ยืนยันการลบรายการต้นทุนนี้?")) return;
        try { await deleteTourCostItem(id); toast({title: "ลบรายการต้นทุนสำเร็จ"}); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการลบต้นทุน", variant: "destructive" }); }
    };

    // --- Income Item Handlers ---
    const handleAddIncomeItem = async () => {
        try {
            await addTourIncomeItem(params.id);
        } catch (error) { toast({ title: "เกิดข้อผิดพลาดในการเพิ่มรายรับ", variant: "destructive" }); }
    };
     const handleUpdateIncomeItem = async (id: string, field: keyof TourIncomeItem, value: any) => {
        try { await updateTourIncomeItem(id, { [field]: value }); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการอัปเดตรายรับ", variant: "destructive" }); }
    };
    const handleDeleteIncomeItem = async (id: string) => {
        if (!window.confirm("ยืนยันการลบรายการรายรับนี้?")) return;
        try { await deleteTourIncomeItem(id); toast({title: "ลบรายการรายรับสำเร็จ"}); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการลบรายรับ", variant: "destructive" }); }
    };

    // --- Program Info Handler ---
    const handleProgramChange = (field: keyof TourProgram, value: any) => {
        if (!program) return;
        setProgram(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSaveProgramInfo = async () => {
        if (!program) return;
        try {
            const { id, createdAt, date, ...dataToUpdate } = program;
            await updateTourProgram(program.id, dataToUpdate);
            toast({ title: "บันทึกข้อมูลโปรแกรมสำเร็จ" });
        } catch (error) {
             console.error("Failed to save program info:", error);
            toast({ title: "เกิดข้อผิดพลาดในการบันทึกข้อมูลโปรแกรม", variant: "destructive" });
        }
    };
    
    const handlePrint = () => {
        window.print();
    }


    const summaryData = useMemo(() => {
        const totalCosts = costItems.reduce((acc, item) => {
            acc.kip += item.kip || 0;
            acc.baht += item.baht || 0;
            acc.usd += item.usd || 0;
            acc.cny += item.cny || 0;
            return acc;
        }, { kip: 0, baht: 0, usd: 0, cny: 0 });

         const totalIncomes = incomeItems.reduce((acc, item) => {
            acc.kip += item.kip || 0;
            acc.baht += item.baht || 0;
            acc.usd += item.usd || 0;
            acc.cny += item.cny || 0;
            return acc;
        }, { kip: 0, baht: 0, usd: 0, cny: 0 });

        const profit = {
            kip: totalIncomes.kip - totalCosts.kip,
            baht: totalIncomes.baht - totalCosts.baht,
            usd: totalIncomes.usd - totalCosts.usd,
            cny: totalIncomes.cny - totalCosts.cny,
        };

        return { totalCosts, totalIncomes, profit };
    }, [costItems, incomeItems]);

    if (!program) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>กำลังโหลดโปรแกรมทัวร์...</p>
             </div>
        )
    }
    
    const ProgramInfoCard = () => (
         <Card className="print:shadow-none print:border-none print:p-0">
            <CardHeader className="print:hidden">
                <CardTitle>รายละเอียดโปรแกรมและข้อมูลกลุ่ม</CardTitle>
                <CardDescription>
                    วันที่สร้าง: {program.createdAt ? format(program.createdAt, "PPP", {locale: th}) : '-'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 print:space-y-2 print:p-0">
                <div className="grid md:grid-cols-3 gap-6 print:gap-1">
                     <div className="grid gap-2">
                        <Label htmlFor="programName">ชื่อโปรแกรม</Label>
                        <Input id="programName" value={program.programName} onChange={(e) => handleProgramChange('programName', e.target.value)} className="print:hidden"/>
                         <p className="hidden print:block print:text-sm print:font-semibold">{program.programName}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="tourCode">รหัสทัวร์</Label>
                        <Input id="tourCode" value={program.tourCode} onChange={(e) => handleProgramChange('tourCode', e.target.value)} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{program.tourCode}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="groupName">ชื่อกลุ่ม</Label>
                        <Input id="groupName" value={program.groupName} onChange={(e) => handleProgramChange('groupName', e.target.value)} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{program.groupName}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pax">จำนวนคน (Pax)</Label>
                        <Input id="pax" type="number" value={program.pax} onChange={(e) => handleProgramChange('pax', Number(e.target.value))} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{program.pax}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="destination">จุดหมาย</Label>
                        <Input id="destination" value={program.destination} onChange={(e) => handleProgramChange('destination', e.target.value)} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{program.destination}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="durationDays">ระยะเวลา (วัน)</Label>
                        <Input id="durationDays" type="number" value={program.durationDays} onChange={(e) => handleProgramChange('durationDays', Number(e.target.value))} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{program.durationDays}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" value={program.price || ''} onChange={(e) => handleProgramChange('price', Number(e.target.value))} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{formatCurrency(program.price)}</p>
                    </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bankCharge">Bank Charge</Label>
                        <Input id="bankCharge" type="number" value={program.bankCharge || ''} onChange={(e) => handleProgramChange('bankCharge', Number(e.target.value))} className="print:hidden"/>
                        <p className="hidden print:block print:text-sm">{formatCurrency(program.bankCharge)}</p>
                    </div>
                      <div className="grid gap-2">
                        <Label htmlFor="totalPrice">Total Price</Label>
                        <Input id="totalPrice" type="number" value={program.totalPrice || ''} readOnly className="bg-muted/50 print:hidden" />
                        <p className="hidden print:block font-bold print:text-sm">{formatCurrency(program.totalPrice)}</p>
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="customerDetails" className="print:text-xs">รายละเอียดลูกค้า/กลุ่ม</Label>
                    <Textarea 
                        id="customerDetails"
                        value={program.customerDetails || ''} 
                        onChange={(e) => handleProgramChange('customerDetails', e.target.value)}
                        placeholder="เช่น เบอร์โทรติดต่อ, หมายเหตุ, หรือข้อตกลงอื่นๆ"
                        rows={4}
                        className="print:hidden"
                    />
                    <p className="hidden print:block whitespace-pre-wrap print:text-sm">{program.customerDetails}</p>
                </div>
                <div className="flex justify-end print:hidden">
                    <Button onClick={handleSaveProgramInfo}>บันทึกข้อมูลโปรแกรม</Button>
                </div>
            </CardContent>
        </Card>
    );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/tour-programs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">กลับไปหน้ารายการ</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">{program.programName || 'รายละเอียดโปรแกรมทัวร์'}</h1>
        </div>
        <div className="ml-auto">
            <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                พิมพ์
            </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 print:p-4 print:gap-2">
        {/* For Printing */}
        <div className="hidden print:block space-y-4">
            <div>
                <h2 className="text-xl font-bold mb-1">รายละเอียดโปรแกรมและข้อมูลกลุ่ม</h2>
                <p className="text-xs text-muted-foreground mb-4">
                    วันที่สร้าง: {program.createdAt ? format(program.createdAt, "d MMMM yyyy", {locale: th}) : '-'}
                </p>
                <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
                    <div><span className="font-semibold">ชื่อโปรแกรม:</span> {program.programName}</div>
                    <div><span className="font-semibold">รหัสทัวร์:</span> {program.tourCode}</div>
                    <div><span className="font-semibold">ชื่อกลุ่ม:</span> {program.groupName}</div>
                    <div><span className="font-semibold">จำนวนคน (Pax):</span> {program.pax}</div>
                    <div><span className="font-semibold">จุดหมาย:</span> {program.destination}</div>
                    <div><span className="font-semibold">ระยะเวลา (วัน):</span> {program.durationDays}</div>
                    <div><span className="font-semibold">Price:</span> {formatCurrency(program.price)}</div>
                    <div><span className="font-semibold">Bank Charge:</span> {formatCurrency(program.bankCharge)}</div>
                    <div><span className="font-semibold">Total Price:</span> {formatCurrency(program.totalPrice)}</div>
                </div>
                 {program.customerDetails && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-sm">รายละเอียดลูกค้า/กลุ่ม:</h3>
                        <p className="whitespace-pre-wrap text-sm">{program.customerDetails}</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-bold border-b pb-1">Total Costs</h2>
                <Table>
                    <TableFooter>
                        <TableRow className="font-bold text-sm">
                             <TableCell className="text-right p-1">ລວມ (Total)</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.kip)} KIP</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.baht)} BAHT</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.usd)} USD</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.cny)} CNY</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-lg font-bold border-b pb-1">Total Income</h2>
                <Table>
                    <TableFooter>
                         <TableRow className="font-bold text-sm">
                             <TableCell className="text-right p-1">ລວມ (Total)</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.kip)} KIP</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.baht)} BAHT</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.usd)} USD</TableCell>
                             <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.cny)} CNY</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <div className="space-y-2 pt-2">
                 <h2 className="text-lg font-bold">สรุปผลประกอบการ</h2>
                 <div className="grid grid-cols-4 gap-2">
                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.kip} currency="KIP" isProfit />
                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.baht} currency="BAHT" isProfit />
                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.usd} currency="USD" isProfit />
                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.cny} currency="CNY" isProfit />
                </div>
            </div>
        </div>

        {/* For Screen */}
        <div className="print:hidden">
            <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">ข้อมูลโปรแกรม</TabsTrigger>
                    <TabsTrigger value="costs">คำนวณต้นทุน</TabsTrigger>
                    <TabsTrigger value="income">บันทึกรายรับ</TabsTrigger>
                    <TabsTrigger value="summary">สรุปผล</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="mt-4">
                    <ProgramInfoCard />
                </TabsContent>
                <TabsContent value="costs" className="mt-4">
                    <CurrencyEntryTable 
                        items={costItems}
                        onAddItem={handleAddCostItem}
                        onUpdateItem={handleUpdateCostItem as any}
                        onDeleteItem={handleDeleteCostItem}
                        title="ตารางคำนวณต้นทุน"
                        description="บันทึกค่าใช้จ่ายทั้งหมดของโปรแกรมนี้"
                    />
                </TabsContent>
                <TabsContent value="income" className="mt-4">
                    <CurrencyEntryTable 
                        items={incomeItems}
                        onAddItem={handleAddIncomeItem}
                        onUpdateItem={handleUpdateIncomeItem as any}
                        onDeleteItem={handleDeleteIncomeItem}
                        title="ตารางบันทึกรายรับ"
                        description="บันทึกรายรับทั้งหมดของโปรแกรมนี้"
                    />
                </TabsContent>
                <TabsContent value="summary" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>สรุปผลประกอบการ</CardTitle>
                            <CardDescription>สรุปรายรับ, ต้นทุน, และกำไร/ขาดทุน สำหรับโปรแกรมนี้</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">ยอดรวมรายรับ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <SummaryCard title="รายรับ" value={summaryData.totalIncomes.kip} currency="KIP" />
                                    <SummaryCard title="รายรับ" value={summaryData.totalIncomes.baht} currency="BAHT" />
                                    <SummaryCard title="รายรับ" value={summaryData.totalIncomes.usd} currency="USD" />
                                    <SummaryCard title="รายรับ" value={summaryData.totalIncomes.cny} currency="CNY" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">ยอดรวมต้นทุน</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.kip} currency="KIP" />
                                    <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.baht} currency="BAHT" />
                                    <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.usd} currency="USD" />
                                    <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.cny} currency="CNY" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">กำไร / ขาดทุนสุทธิ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.kip} currency="KIP" isProfit />
                                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.baht} currency="BAHT" isProfit />
                                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.usd} currency="USD" isProfit />
                                    <SummaryCard title="กำไร/ขาดทุน" value={summaryData.profit.cny} currency="CNY" isProfit />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  )
}
