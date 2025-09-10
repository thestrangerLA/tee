

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
        <Card>
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
             <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px] print:hidden">ວັນທີ (Date)</TableHead>
                                <TableHead>ລາຍລະອຽດ (Description)</TableHead>
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
                                    <TableCell className="p-1 print:hidden">
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
                                    <TableCell className="p-1 text-center print:hidden">
                                        <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted font-bold">
                                <TableCell colSpan={2} className="text-right print:hidden">ລວມ (Total)</TableCell>
                                <TableCell colSpan={1} className="text-right hidden print:table-cell">ລວມ (Total)</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.kip)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.baht)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.usd)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.cny)}</TableCell>
                                <TableCell className="print:hidden"></TableCell>
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


export default function TourProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    
    const [localProgram, setLocalProgram] = useState<TourProgram | null>(null);
    const [costItems, setCostItems] = useState<TourCostItem[]>([]);
    const [incomeItems, setIncomeItems] = useState<TourIncomeItem[]>([]);
    const [printCurrencies, setPrintCurrencies] = useState<Currency[]>(['KIP']);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        
        let isActive = true;
        setIsLoading(true);

        const fetchProgram = async () => {
            const programData = await getTourProgram(id);
            if (isActive && programData) {
                setLocalProgram(programData);
                if (programData.priceCurrency) {
                    setPrintCurrencies([programData.priceCurrency]);
                }
            }
             if (isActive) {
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
            const { id, createdAt, date, ...dataToUpdate } = localProgram;
            await updateTourProgram(id, dataToUpdate);
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
            
            setTimeout(() => {
                 if (newState.priceCurrency === newState.bankChargeCurrency) {
                    newState.totalPrice = newState.price + newState.bankCharge;
                } else {
                    newState.totalPrice = newState.price;
                }
                const { id, createdAt, date, ...dataToUpdate } = newState;
                updateTourProgram(id, dataToUpdate).then(() => {
                    toast({ title: "บันทึกข้อมูลโปรแกรมแล้ว" });
                }).catch(err => {
                    console.error("Failed to save program info:", err);
                    toast({ title: "เกิดข้อผิดพลาดในการบันทึก", variant: "destructive" });
                });
            }, 0);

            return newState;
        });
    }, [toast]);
    
    const handleCustomerDetailChange = (index: number, value: string) => {
        setLocalProgram(prev => {
            if (!prev || !prev.customerDetails) return prev;
            const newDetails = [...prev.customerDetails];
            newDetails[index] = value;
            return { ...prev, customerDetails: newDetails };
        });
    };

    const handleAddCustomerDetail = async () => {
        if (!localProgram) return;
        const newDetails = [...(localProgram.customerDetails || []), ''];
        handleProgramChange('customerDetails', newDetails);
    };

    const handleRemoveCustomerDetail = async (index: number) => {
        if (!localProgram || !localProgram.customerDetails) return;
        const newDetails = localProgram.customerDetails.filter((_, i) => i !== index);
        handleProgramChange('customerDetails', newDetails);
        await handleSaveProgramInfo();
    };

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
    
    const ProgramInfoCard = () => (
         <Card className="print:shadow-none print:border-none print:p-0">
            <CardHeader className="print:hidden">
                <CardTitle>รายละเอียดโปรแกรมและข้อมูลกลุ่ม</CardTitle>
                <CardDescription>
                    วันที่สร้าง: {localProgram.createdAt ? format(localProgram.createdAt, "PPP", {locale: th}) : '-'}
                     {isSaving && <span className="ml-4 text-blue-500 animate-pulse">กำลังบันทึก...</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 print:space-y-2 print:p-0">
                 <div className="grid md:grid-cols-3 gap-6 print:gap-2">
                     <div className="grid gap-2">
                        <Label htmlFor="programName">ชื่อโปรแกรม</Label>
                        <Input id="programName" value={localProgram.programName} onChange={(e) => handleProgramChange('programName', e.target.value)} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                         <p className="hidden print:block print:text-sm print:font-semibold">{localProgram.programName}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="tourCode">รหัสทัวร์</Label>
                        <Input id="tourCode" value={localProgram.tourCode} onChange={(e) => handleProgramChange('tourCode', e.target.value)} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                        <p className="hidden print:block print:text-sm">{localProgram.tourCode}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="groupName">ชื่อกลุ่ม</Label>
                        <Input id="groupName" value={localProgram.groupName} onChange={(e) => handleProgramChange('groupName', e.target.value)} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                        <p className="hidden print:block print:text-sm">{localProgram.groupName}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tourDates">วันที่เดินทาง (Tour Dates)</Label>
                        <Input id="tourDates" value={localProgram.tourDates || ''} onChange={(e) => handleProgramChange('tourDates', e.target.value)} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                        <p className="hidden print:block print:text-sm">{localProgram.tourDates}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pax">จำนวนคน (Pax)</Label>
                        <Input id="pax" type="number" value={localProgram.pax} onChange={(e) => handleProgramChange('pax', Number(e.target.value))} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                        <p className="hidden print:block print:text-sm">{localProgram.pax}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="destination">จุดหมาย</Label>
                        <Input id="destination" value={localProgram.destination} onChange={(e) => handleProgramChange('destination', e.target.value)} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                        <p className="hidden print:block print:text-sm">{localProgram.destination}</p>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="durationDays">ระยะเวลา (วัน)</Label>
                        <Input id="durationDays" type="number" value={localProgram.durationDays} onChange={(e) => handleProgramChange('durationDays', Number(e.target.value))} onBlur={handleSaveProgramInfo} className="print:hidden" disabled={isSaving} />
                        <p className="hidden print:block print:text-sm">{localProgram.durationDays}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
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

                <Card className="print:shadow-none print:border-none print:p-0">
                    <CardHeader className="flex flex-row items-center justify-between print:hidden">
                        <div>
                            <CardTitle className="text-lg">รายละเอียดลูกค้า/กลุ่ม</CardTitle>
                            <CardDescription>บันทึกเบอร์โทร, หมายเหตุ, หรือข้อตกลงอื่นๆ</CardDescription>
                        </div>
                        <Button size="sm" onClick={handleAddCustomerDetail} disabled={isSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            เพิ่มรายการ
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2 print:hidden">
                        {(localProgram.customerDetails || []).map((detail, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={detail}
                                    onChange={(e) => handleCustomerDetailChange(index, e.target.value)}
                                    onBlur={() => handleSaveProgramInfo()}
                                    placeholder={`รายละเอียด #${index + 1}`}
                                    disabled={isSaving}
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomerDetail(index)} disabled={isSaving}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        {(localProgram.customerDetails?.length === 0 || !localProgram.customerDetails) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                ยังไม่มีรายละเอียดลูกค้า
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="hidden print:block space-y-1">
                    <h3 className="font-semibold text-xs print:font-lao">ລາຍລະອຽດລູກຄ້າ/ກຸ່ມ:</h3>
                    <ul className="list-disc list-inside text-xs space-y-0.5">
                        {(localProgram.customerDetails || []).map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
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
        {/* For Printing */}
        <div className="hidden print:block print:space-y-2">
            <h2 className="text-lg font-bold mb-2 text-center print:font-lao">ລາຍລະອຽດໜ້າວຽກຂອງແຕ່ລະກຸ່ມ</h2>
            
            <div className="grid grid-cols-2 gap-x-8 text-sm">
                {/* Column 1 */}
                <div className="space-y-1">
                    <div className="flex justify-between"><strong className="font-semibold">Program Name:</strong><span>{localProgram.programName}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Tour Dates:</strong><span>{localProgram.tourDates}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Duration:</strong><span>{localProgram.durationDays} days</span></div>
                </div>
                {/* Column 2 */}
                <div className="space-y-1">
                    <div className="flex justify-between"><strong className="font-semibold">Tour Code:</strong><span>{localProgram.tourCode}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Group Name:</strong><span>{localProgram.groupName}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Pax:</strong><span>{localProgram.pax}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Destination:</strong><span>{localProgram.destination}</span></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 text-sm mt-2 pt-2 border-t">
                 {/* Financials */}
                 <div className="space-y-1">
                    <div className="flex justify-between"><strong className="font-semibold">Price:</strong><span className="font-bold">{formatCurrency(localProgram.price)} {localProgram.priceCurrency}</span></div>
                    <div className="flex justify-between"><strong className="font-semibold">Bank Charge:</strong><span className="font-bold">{formatCurrency(localProgram.bankCharge)} {localProgram.bankChargeCurrency}</span></div>
                    {localProgram.priceCurrency === localProgram.bankChargeCurrency && (
                        <div className="flex justify-between"><strong className="font-semibold">Total Price:</strong><span className="font-bold">{formatCurrency(localProgram.totalPrice)} {localProgram.priceCurrency}</span></div>
                    )}
                 </div>
                 <div className="space-y-1">
                    {/* Empty space for alignment, or add other info here */}
                 </div>
            </div>
            
             {localProgram.customerDetails && localProgram.customerDetails.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                    <h3 className="font-semibold text-sm print:font-lao">ລາຍລະອຽດລູກຄ້າ/ກຸ່ມ:</h3>
                    <ul className="list-disc list-inside text-sm space-y-0.5 pl-2">
                        {(localProgram.customerDetails).map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-1 pt-2">
                <h2 className="text-sm font-bold border-b pb-1 print:font-lao">ລາຍຈ່າຍ (Total Costs)</h2>
                <Table>
                    <TableFooter>
                        <TableRow className="font-bold text-xs">
                             <TableCell className="text-right p-1">ລວມ (Total)</TableCell>
                            {printCurrencies.includes('KIP') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.kip)} KIP</TableCell>}
                            {printCurrencies.includes('BAHT') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.baht)} BAHT</TableCell>}
                            {printCurrencies.includes('USD') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.usd)} USD</TableCell>}
                            {printCurrencies.includes('CNY') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalCosts.cny)} CNY</TableCell>}
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="space-y-1 pt-1">
                <h2 className="text-sm font-bold border-b pb-1 print:font-lao">ລາຍຮັບ (Total Income)</h2>
                <Table>
                    <TableFooter>
                         <TableRow className="font-bold text-xs">
                             <TableCell className="text-right p-1">ລວມ (Total)</TableCell>
                             {printCurrencies.includes('KIP') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.kip)} KIP</TableCell>}
                             {printCurrencies.includes('BAHT') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.baht)} BAHT</TableCell>}
                             {printCurrencies.includes('USD') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.usd)} USD</TableCell>}
                             {printCurrencies.includes('CNY') && <TableCell className="text-right p-1">{formatCurrency(summaryData.totalIncomes.cny)} CNY</TableCell>}
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <div className="space-y-1 pt-2">
                 <h2 className="text-sm font-bold print:font-lao">ກຳໄລ/ຂາດທຶນ (Profit/Loss Summary)</h2>
                 <div className="grid grid-cols-4 gap-2">
                    {printCurrencies.includes('KIP') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.kip} currency="KIP" isProfit />}
                    {printCurrencies.includes('BAHT') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.baht} currency="BAHT" isProfit />}
                    {printCurrencies.includes('USD') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.usd} currency="USD" isProfit />}
                    {printCurrencies.includes('CNY') && <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.cny} currency="CNY" isProfit />}
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
                        description="บันทึกรายรับทั้งหมด ของโปรแกรมนี้"
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
                                    <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.kip} currency="KIP" isProfit />
                                    <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.baht} currency="BAHT" isProfit />
                                    <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.usd} currency="USD" isProfit />
                                    <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={summaryData.profit.cny} currency="CNY" isProfit />
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
