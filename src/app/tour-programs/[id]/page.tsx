

"use client"

import { useState, useMemo, useEffect, useCallback, use } from 'react';
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
import type { TourCostItem, TourIncomeItem, TourProgram, Currency } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';


const formatCurrency = (value: number | null | undefined, includeSymbol = false) => {
    if (value === null || value === undefined || isNaN(value)) return includeSymbol ? '0' : '';
    const formatted = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
    return formatted;
};

const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, '')) || 0;
};

const allCurrencies: Currency[] = ['KIP', 'BAHT', 'USD', 'CNY'];

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
        <Card className="print:shadow-none print:border-none">
            <CardHeader className="flex flex-row items-center justify-between print:hidden">
                 <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                 <Button size="sm" onClick={onAddItem}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    เพิ่มรายการ
                </Button>
            </CardHeader>
             <CardContent className="print:p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px] print:w-[100px] print:text-xs print:font-lao">ວັນທີ (Date)</TableHead>
                                <TableHead className="print:font-lao">ລາຍລະອຽດ (Description)</TableHead>
                                <TableHead className="text-right">KIP</TableHead>
                                <TableHead className="text-right">BAHT</TableHead>
                                <TableHead className="text-right">USD</TableHead>
                                <TableHead className="text-right">CNY</TableHead>
                                <TableHead className="w-[50px] print:hidden"><span className="sr-only">ลบ</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(items as Array<TourCostItem | TourIncomeItem>).map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="p-1">
                                        <Popover>
                                            <PopoverTrigger asChild className="print:hidden">
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
                                        <span className="hidden print:inline print:text-xs">{item.date ? format(item.date, "dd/MM/yy") : ''}</span>
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input 
                                            defaultValue={item.detail || ''} 
                                            onBlur={(e) => onUpdateItem(item.id, 'detail', e.target.value)}
                                            className="h-8 print:border-none print:pl-0 print:font-lao print:text-sm"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.kip)}
                                            onBlur={(e) => onUpdateItem(item.id, 'kip', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right print:border-none print:text-sm"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.baht)}
                                            onBlur={(e) => onUpdateItem(item.id, 'baht', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right print:border-none print:text-sm"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.usd)}
                                            onBlur={(e) => onUpdateItem(item.id, 'usd', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right print:border-none print:text-sm"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.cny)}
                                            onBlur={(e) => onUpdateItem(item.id, 'cny', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right print:border-none print:text-sm"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1 text-center print:hidden">
                                        <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter className="print:hidden">
                            <TableRow className="bg-muted font-bold">
                                <TableCell colSpan={2} className="text-right print:font-lao">ລວມ (Total)</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.kip)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.baht)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.usd)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.cny)}</TableCell>
                                <TableCell className="print:hidden"></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                 <div className="hidden print:block pt-4">
                    <Table>
                        <TableFooter>
                            <TableRow className="bg-muted font-bold">
                                <TableCell colSpan={2} className="text-right print:font-lao">ລວມ (Total)</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.kip)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.baht)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.usd)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.cny)}</TableCell>
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
        <Card className="print:shadow-none print:border print:p-0">
            <CardHeader className="pb-2 print:p-1 print:font-lao">
                <CardTitle className="text-base print:text-xs">{title}</CardTitle>
                <CardDescription className="print:text-xs">{currency}</CardDescription>
            </CardHeader>
            <CardContent className="print:p-1">
                <p className={`text-2xl font-bold print:text-base ${isProfit ? profitColor : ''}`}>{formatCurrency(value, true)}</p>
            </CardContent>
        </Card>
    );
};

const CurrencyInput = ({ label, amount, currency, onAmountChange, onCurrencyChange, onBlur, disabled }: {
    label: string;
    amount: number;
    currency: Currency;
    onAmountChange: (value: number) => void;
    onCurrencyChange: (value: Currency) => void;
    onBlur: () => void;
    disabled?: boolean;
}) => (
    <div className="grid gap-2">
        <Label htmlFor={label.toLowerCase()} className="print:hidden">{label}</Label>
        <p className="hidden print:block print:text-xs font-semibold">{label}</p>
        <div className="flex gap-2">
            <Input
                id={label.toLowerCase()}
                type="number"
                value={amount || ''}
                onChange={(e) => onAmountChange(Number(e.target.value))}
                onBlur={onBlur}
                className="w-2/3 print:hidden"
                disabled={disabled}
            />
            <Select value={currency} onValueChange={(v) => { onCurrencyChange(v as Currency); onBlur(); }} disabled={disabled}>
                <SelectTrigger className="w-1/3 print:hidden">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {allCurrencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
            <p className="hidden print:block print:text-sm">{`${formatCurrency(amount)} ${currency}`}</p>
        </div>
    </div>
);

type TabValue = 'info' | 'income' | 'costs' | 'summary';

export default function TourProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    
    const [localProgram, setLocalProgram] = useState<TourProgram | null>(null);
    const [costItems, setCostItems] = useState<TourCostItem[]>([]);
    const [incomeItems, setIncomeItems] = useState<TourIncomeItem[]>([]);
    const [printCurrencies, setPrintCurrencies] = useState<Currency[]>(['KIP']);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('info');

    useEffect(() => {
        if (!id) return;
        
        let isActive = true;
        setIsLoading(true);

        const fetchProgram = async () => {
            const programData = await getTourProgram(id);
            if (isActive) {
                if (programData) {
                    setLocalProgram(programData);
                    if (programData.priceCurrency) {
                        setPrintCurrencies([programData.priceCurrency]);
                    }
                }
                setIsLoading(false);
            }
        };

        fetchProgram();
        const unsubscribeCosts = listenToTourCostItemsForProgram(id, setCostItems);
        const unsubscribeIncomes = listenToTourIncomeItemsForProgram(id, setIncomeItems);
        
        return () => {
            isActive = false;
            unsubscribeCosts();
            unsubscribeIncomes();
        };
    }, [id]);

    const handleProgramChange = useCallback((field: keyof TourProgram, value: any) => {
        setLocalProgram(prev => prev ? { ...prev, [field]: value } : null);
    }, []);

    const handleSaveProgramInfo = useCallback(async () => {
        if (!localProgram || isSaving) return;
        
        setIsSaving(true);
        try {
            // Recalculate total price before saving
            const updatedProgram = { ...localProgram };
             if (updatedProgram.priceCurrency === updatedProgram.bankChargeCurrency) {
                updatedProgram.totalPrice = (updatedProgram.price || 0) + (updatedProgram.bankCharge || 0);
            } else {
                updatedProgram.totalPrice = updatedProgram.price || 0;
            }

            const { id, createdAt, date, ...dataToUpdate } = updatedProgram;
            await updateTourProgram(id, dataToUpdate);
            
            // Re-sync local state with the just saved data to be safe
            setLocalProgram(updatedProgram);

            toast({ title: "บันทึกข้อมูลโปรแกรมแล้ว" });
        } catch (error) {
             console.error("Failed to save program info:", error);
            toast({ title: "เกิดข้อผิดพลาดในการบันทึก", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [localProgram, isSaving, toast]);
    
    const handleSelectChange = useCallback((field: keyof TourProgram, value: any) => {
         setLocalProgram(prev => {
            if (!prev) return null;
            const newState = { ...prev, [field]: value };
            return newState;
        });
        // Save automatically when select changes
        setTimeout(handleSaveProgramInfo, 0);
    }, [handleSaveProgramInfo]);

    // --- Cost Item Handlers ---
    const handleAddCostItem = async () => {
        if (!id) return;
        try {
            await addTourCostItem(id);
        } catch (error) { toast({ title: "เกิดข้อผิดพลาดในการเพิ่มต้นทุน", variant: "destructive" }); }
    };
     const handleUpdateCostItem = async (itemId: string, field: keyof TourCostItem, value: any) => {
        try { await updateTourCostItem(itemId, { [field]: value }); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการอัปเดตต้นทุน", variant: "destructive" }); }
    };
    const handleDeleteCostItem = async (itemId: string) => {
        if (!window.confirm("ยืนยันการลบรายการต้นทุนนี้?")) return;
        try { await deleteTourCostItem(itemId); toast({title: "ลบรายการต้นทุนสำเร็จ"}); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการลบต้นทุน", variant: "destructive" }); }
    };

    // --- Income Item Handlers ---
    const handleAddIncomeItem = async () => {
        if (!id) return;
        try {
            await addTourIncomeItem(id);
        } catch (error) { toast({ title: "เกิดข้อผิดพลาดในการเพิ่มรายรับ", variant: "destructive" }); }
    };
     const handleUpdateIncomeItem = async (itemId: string, field: keyof TourIncomeItem, value: any) => {
        try { await updateTourIncomeItem(itemId, { [field]: value }); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการอัปเดตรายรับ", variant: "destructive" }); }
    };
    const handleDeleteIncomeItem = async (itemId: string) => {
        if (!window.confirm("ยืนยันการลบรายการรายรับนี้?")) return;
        try { await deleteTourIncomeItem(itemId); toast({title: "ลบรายการรายรับสำเร็จ"}); } 
        catch (error) { toast({ title: "เกิดข้อผิดพลาดในการลบรายรับ", variant: "destructive" }); }
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
    
    const handlePrintCurrencyToggle = (currency: Currency) => {
        setPrintCurrencies(prev => 
            prev.includes(currency) 
                ? prev.filter(c => c !== currency) 
                : [...prev, currency]
        );
    };

    if (isLoading) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
                <div className="w-full max-w-4xl space-y-4">
                    <Skeleton className="h-12 w-1/3" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
             </div>
        )
    }

    if (!localProgram) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>ไม่พบข้อมูลโปรแกรมทัวร์</p>
             </div>
        )
    }
    
    const PrintHeader = ({ title }: { title: string }) => (
         <div className="hidden print:block print:space-y-4 pb-4 mb-4">
            <h2 className="text-lg font-bold mb-2 text-center font-lao">{title}</h2>
             <div className="grid grid-cols-2 gap-x-8 text-sm border-b-2 border-slate-300 pb-4">
                 <div className="space-y-1">
                    <div className="flex justify-between"><strong className="font-semibold">Tour Program:</strong><span>{localProgram.programName}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Tour Dates:</strong><span className="whitespace-pre-wrap text-right">{localProgram.tourDates}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Duration:</strong><span>{localProgram.durationDays} days</span></div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between"><strong className="font-semibold">Group Code:</strong><span>{localProgram.tourCode}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Nationality:</strong><span>{localProgram.groupName}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Pax:</strong><span>{localProgram.pax}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Destination:</strong><span>{localProgram.destination}</span></div>
                </div>
            </div>
            {activeTab === 'summary' && (
                 <div className="hidden print:grid print:grid-cols-2 print:gap-x-8 print:text-sm print:border-b-2 print:border-slate-300 print:pb-4 print:mb-4">
                    <div>
                        <div className="flex justify-between"><strong className="font-semibold">Price:</strong><span className="font-bold">{`${formatCurrency(localProgram.price)} ${localProgram.priceCurrency}`}</span></div>
                        <div className="flex justify-between"><strong className="font-semibold">Bank Charge:</strong><span className="font-bold">{`${formatCurrency(localProgram.bankCharge)} ${localProgram.bankChargeCurrency}`}</span></div>
                    </div>
                    <div>
                        <div className="flex justify-between"><strong className="font-semibold">Total Price:</strong><span className="font-bold">{`${formatCurrency(localProgram.totalPrice)} ${localProgram.priceCurrency}`}</span></div>
                    </div>
                 </div>
            )}
        </div>
    );

    const ProgramInfoCard = () => (
         <Card className="print:hidden">
            <CardHeader>
                <CardTitle>รายละเอียดโปรแกรมและข้อมูลกลุ่ม</CardTitle>
                <CardDescription>
                    วันที่สร้าง: {localProgram.createdAt ? format(localProgram.createdAt, "PPP", {locale: th}) : '-'}
                     {isSaving && <span className="ml-4 text-blue-500 animate-pulse">กำลังบันทึก...</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid md:grid-cols-3 gap-6">
                     <div className="grid gap-2">
                        <Label htmlFor="programName">Tour Program</Label>
                        <Input id="programName" value={localProgram.programName} onChange={(e) => handleProgramChange('programName', e.target.value)} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="tourCode">Group Code</Label>
                        <Input id="tourCode" value={localProgram.tourCode} onChange={(e) => handleProgramChange('tourCode', e.target.value)} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="groupName">Nationality</Label>
                        <Input id="groupName" value={localProgram.groupName} onChange={(e) => handleProgramChange('groupName', e.target.value)} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                    <div className="grid gap-2 md:col-span-3">
                        <Label htmlFor="tourDates">วันที่เดินทาง (Tour Dates)</Label>
                        <Textarea id="tourDates" value={localProgram.tourDates || ''} onChange={(e) => handleProgramChange('tourDates', e.target.value)} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pax">จำนวนคน (Pax)</Label>
                        <Input id="pax" type="number" value={localProgram.pax} onChange={(e) => handleProgramChange('pax', Number(e.target.value))} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="destination">จุดหมาย</Label>
                        <Input id="destination" value={localProgram.destination} onChange={(e) => handleProgramChange('destination', e.target.value)} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="durationDays">ระยะเวลา (วัน)</Label>
                        <Input id="durationDays" type="number" value={localProgram.durationDays} onChange={(e) => handleProgramChange('durationDays', Number(e.target.value))} onBlur={handleSaveProgramInfo} disabled={isSaving} />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                     <CurrencyInput 
                        label="Price"
                        amount={localProgram.price}
                        currency={localProgram.priceCurrency}
                        onAmountChange={(v) => handleProgramChange('price', v)}
                        onCurrencyChange={(v) => handleSelectChange('priceCurrency', v)}
                        onBlur={handleSaveProgramInfo}
                        disabled={isSaving}
                     />
                     <CurrencyInput 
                        label="Bank Charge"
                        amount={localProgram.bankCharge}
                        currency={localProgram.bankChargeCurrency}
                        onAmountChange={(v) => handleProgramChange('bankCharge', v)}
                        onCurrencyChange={(v) => handleSelectChange('bankChargeCurrency', v)}
                        onBlur={handleSaveProgramInfo}
                        disabled={isSaving}
                     />
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
            <h1 className="text-xl font-bold tracking-tight font-headline">{localProgram.programName || 'รายละเอียดโปรแกรมทัวร์'}</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
             <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">สกุลเงินสำหรับพิมพ์:</span>
                {allCurrencies.map((currency) => (
                <div key={currency} className="flex items-center space-x-1">
                    <Checkbox
                        id={`print-${currency}`}
                        checked={printCurrencies.includes(currency)}
                        onCheckedChange={() => handlePrintCurrencyToggle(currency)}
                    />
                    <Label htmlFor={`print-${currency}`} className="text-sm font-normal">{currency}</Label>
                </div>
                ))}
            </div>
            <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                พิมพ์
            </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 print:p-2 print:gap-1">
        <Tabs defaultValue="info" onValueChange={(v) => setActiveTab(v as TabValue)} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 print:hidden">
              <TabsTrigger value="info">ข้อมูลโปรแกรม</TabsTrigger>
              <TabsTrigger value="income">บันทึกรายรับ</TabsTrigger>
              <TabsTrigger value="costs">คำนวณต้นทุน</TabsTrigger>
              <TabsTrigger value="summary">สรุปผล</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4">
              <ProgramInfoCard />
          </TabsContent>
          <TabsContent value="income" className="mt-4">
               <div className={activeTab === 'income' ? 'block' : 'hidden'}>
                  <PrintHeader title="ລາຍຮັບ (Total Income)" />
                  <CurrencyEntryTable 
                      items={incomeItems}
                      onAddItem={handleAddIncomeItem}
                      onUpdateItem={handleUpdateIncomeItem as any}
                      onDeleteItem={handleDeleteIncomeItem}
                      title="ตารางบันทึกรายรับ"
                      description="บันทึกรายรับทั้งหมด ของโปรแกรมนี้"
                  />
              </div>
          </TabsContent>
          <TabsContent value="costs" className="mt-4">
               <div className={activeTab === 'costs' ? 'block' : 'hidden'}>
                  <PrintHeader title="ລາຍຈ່າຍ (Total Costs)" />
                  <CurrencyEntryTable 
                      items={costItems}
                      onAddItem={handleAddCostItem}
                      onUpdateItem={handleUpdateCostItem as any}
                      onDeleteItem={handleDeleteCostItem}
                      title="ตารางคำนวณต้นทุน"
                      description="บันทึกค่าใช้จ่ายทั้งหมดของโปรแกรมนี้"
                  />
              </div>
          </TabsContent>
          <TabsContent value="summary" className="mt-4">
                <div className={activeTab === 'summary' ? 'block' : 'hidden'}>
                    <PrintHeader title="ສະຫຼຸບໂປຣແກມທົວ (Tour Program Summary)" />
                    <div className="hidden print:block space-y-4">
                        <div className="space-y-2">
                             <h3 className="text-base font-semibold border-b pb-1 font-lao">ລາຍຈ່າຍ (Total Costs)</h3>
                             <div className="flex justify-between text-sm pr-4">
                                <span className="font-lao">ລວມ (Total)</span>
                                <div className='flex gap-4 font-semibold'>
                                    {printCurrencies.map(c => <span key={c}>{`${formatCurrency((summaryData.totalCosts as any)[c.toLowerCase()])} ${c}`}</span>)}
                                </div>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <h3 className="text-base font-semibold border-b pb-1 font-lao">ລາຍຮັບ (Total Income)</h3>
                             <div className="flex justify-between text-sm pr-4">
                                <span className="font-lao">ລວມ (Total)</span>
                                <div className='flex gap-4 font-semibold'>
                                     {printCurrencies.map(c => <span key={c}>{`${formatCurrency((summaryData.totalIncomes as any)[c.toLowerCase()])} ${c}`}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-base font-semibold border-b pb-1 font-lao">ກໍາໄລ/ຂາດທຶນ (Profit/Loss Summary)</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>สกุลเงิน (Currency)</TableHead>
                                        <TableHead className="text-right">ລາຍຈ່າຍ (Costs)</TableHead>
                                        <TableHead className="text-right">ລາຍຮັບ (Income)</TableHead>
                                        <TableHead className="text-right">ກໍາໄລ/ຂາດທຶນ (Profit/Loss)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {printCurrencies.map(c => {
                                        const currencyKey = c.toLowerCase() as keyof typeof summaryData.profit;
                                        return (
                                            <TableRow key={c}>
                                                <TableCell className="font-medium">{c}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(summaryData.totalCosts[currencyKey])}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(summaryData.totalIncomes[currencyKey])}</TableCell>
                                                <TableCell className={`text-right font-bold ${summaryData.profit[currencyKey] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(summaryData.profit[currencyKey])}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                             </Table>
                        </div>
                    </div>
                </div>
              <Card className="print:hidden">
                  <CardHeader>
                      <CardTitle>สรุปผลประกอบการ</CardTitle>
                      <CardDescription>สรุปรายรับ, ต้นทุน, และกำไร/ขาดทุน สำหรับโปรแกรมนี้</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 print:p-0 print:space-y-2">
                       <div>
                          <h3 className="text-lg font-semibold mb-2 print:font-lao print:text-sm print:font-bold print:border-b print:pb-1">ລາຍຮັບ (Total Income)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                              <SummaryCard title="รายรับ" value={summaryData.totalIncomes.kip} currency="KIP" />
                              <SummaryCard title="รายรับ" value={summaryData.totalIncomes.baht} currency="BAHT" />
                              <SummaryCard title="รายรับ" value={summaryData.totalIncomes.usd} currency="USD" />
                              <SummaryCard title="รายรับ" value={summaryData.totalIncomes.cny} currency="CNY" />
                          </div>
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold mb-2 print:font-lao print:text-sm print:font-bold print:border-b print:pb-1">ລາຍຈ່າຍ (Total Costs)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                              <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.kip} currency="KIP" />
                              <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.baht} currency="BAHT" />
                              <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.usd} currency="USD" />
                              <SummaryCard title="ต้นทุน" value={summaryData.totalCosts.cny} currency="CNY" />
                          </div>
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold mb-2 print:font-lao print:text-sm print:font-bold print:border-b print:pb-1">ກຳໄລ / ຂາດທຶນ (Profit / Loss)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                              {printCurrencies.includes('KIP') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.kip} currency="KIP" isProfit />}
                              {printCurrencies.includes('BAHT') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.baht} currency="BAHT" isProfit />}
                              {printCurrencies.includes('USD') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.usd} currency="USD" isProfit />}
                              {printCurrencies.includes('CNY') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.cny} currency="CNY" isProfit />}
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>
      </main>
    </div>
  )
}
