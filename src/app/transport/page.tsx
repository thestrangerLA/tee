
"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, Truck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);
}

const TransportEntryRow = ({ row, onRowChange, onRowDelete, index }: { row: any, onRowChange: any, onRowDelete: any, index: number }) => (
    <TableRow>
        <TableCell className="p-1">
            <Input type="text" value={row.ans_date} onChange={(e) => onRowChange(index, 'ans_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.ans_cost || ''} onChange={(e) => onRowChange(index, 'ans_cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.ans_amount || ''} onChange={(e) => onRowChange(index, 'ans_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
             <Checkbox checked={row.ans_finished} onCheckedChange={(checked) => onRowChange(index, 'ans_finished', checked)} />
        </TableCell>
        <TableCell className="p-1">
            <Input type="text" value={row.hal_date} onChange={(e) => onRowChange(index, 'hal_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.hal_cost || ''} onChange={(e) => onRowChange(index, 'hal_cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.hal_amount || ''} onChange={(e) => onRowChange(index, 'hal_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
            <Checkbox checked={row.hal_finished} onCheckedChange={(checked) => onRowChange(index, 'hal_finished', checked)} />
        </TableCell>
        <TableCell className="p-1">
            <Input type="text" value={row.mx_date} onChange={(e) => onRowChange(index, 'mx_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
         <TableCell className="p-1">
            <Input type="number" value={row.mx_cost || ''} onChange={(e) => onRowChange(index, 'mx_cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.mx_amount || ''} onChange={(e) => onRowChange(index, 'mx_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
             <Checkbox checked={row.mx_finished} onCheckedChange={(checked) => onRowChange(index, 'mx_finished', checked)} />
        </TableCell>
        <TableCell className="p-1 text-center">
            <Button variant="ghost" size="icon" onClick={() => onRowDelete(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </TableCell>
    </TableRow>
);


export default function TransportPage() {
    const { toast } = useToast();
    
    const initialRowState = {
        ans_date: '', ans_cost: 0, ans_amount: 0, ans_finished: false,
        hal_date: '', hal_cost: 0, hal_amount: 0, hal_finished: false,
        mx_date: '', mx_cost: 0, mx_amount: 0, mx_finished: false,
    };
    const [transportRows, setTransportRows] = useState([initialRowState]);
    
    const transportTotal = useMemo(() => {
        return transportRows.reduce((total, row) => {
            return total + (row.ans_amount || 0) + (row.hal_amount || 0) + (row.mx_amount || 0);
        }, 0);
    }, [transportRows]);

    const transportRemaining = useMemo(() => {
        return transportRows.reduce((total, row) => {
            let remaining = 0;
            if (!row.ans_finished) remaining += (row.ans_amount || 0);
            if (!row.hal_finished) remaining += (row.hal_amount || 0);
            if (!row.mx_finished) remaining += (row.mx_amount || 0);
            return total + remaining;
        }, 0);
    }, [transportRows]);

    const handleAddTransportRow = () => {
        setTransportRows([...transportRows, initialRowState]);
    };

    const handleTransportRowChange = (index: number, field: string, value: any) => {
        const updatedRows = [...transportRows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };
        setTransportRows(updatedRows);
    };

    const handleTransportRowDelete = (index: number) => {
        if (transportRows.length <= 1) {
            toast({ title: "ไม่สามารถลบได้", description: "ต้องมีอย่างน้อย 1 แถว", variant: "destructive" });
            return;
        }
        const updatedRows = transportRows.filter((_, i) => i !== index);
        setTransportRows(updatedRows);
    };

    const handleSaveTransportData = () => {
        console.log("Transport Data:", transportRows);
        // Here you would typically save the data to your backend/database
        toast({
            title: "บันทึกข้อมูลสำเร็จ (จำลอง)",
            description: `ยอดรวมค่าขนส่ง ${formatCurrency(transportTotal)} ได้ถูกบันทึก`,
        });
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
                    <Truck className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">บัญชีขนส่ง</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:grid md:grid-cols-3 md:gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>บันทึกค่าขนส่ง</CardTitle>
                            <CardDescription>กรอกข้อมูลค่าใช้จ่ายในการขนส่งแต่ละประเภท</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="min-w-full whitespace-nowrap">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead colSpan={4} className="text-center border-r bg-blue-50">ANS</TableHead>
                                            <TableHead colSpan={4} className="text-center border-r bg-green-50">HAL</TableHead>
                                            <TableHead colSpan={4} className="text-center border-r bg-orange-50">MX</TableHead>
                                            <TableHead className="text-center bg-gray-50">ลบ</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            {/* ANS */}
                                            <TableHead className="text-center">วันที่</TableHead>
                                            <TableHead className="text-center">ต้นทุน</TableHead>
                                            <TableHead className="text-center">จำนวนเงิน</TableHead>
                                            <TableHead className="text-center border-r">เสร็จสิ้น</TableHead>
                                            {/* HAL */}
                                            <TableHead className="text-center">วันที่</TableHead>
                                            <TableHead className="text-center">ต้นทุน</TableHead>
                                            <TableHead className="text-center">จำนวนเงิน</TableHead>
                                            <TableHead className="text-center border-r">เสร็จสิ้น</TableHead>
                                            {/* MX */}
                                            <TableHead className="text-center">วันที่</TableHead>
                                            <TableHead className="text-center">ต้นทุน</TableHead>
                                            <TableHead className="text-center">จำนวนเงิน</TableHead>
                                            <TableHead className="text-center border-r">เสร็จสิ้น</TableHead>
                                            {/* Actions */}
                                            <TableHead className="text-center"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transportRows.map((row, index) => (
                                            <TransportEntryRow 
                                                key={index}
                                                index={index}
                                                row={row} 
                                                onRowChange={handleTransportRowChange}
                                                onRowDelete={handleTransportRowDelete}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                           
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1 mt-4 md:mt-0 flex flex-col gap-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>สรุปยอด</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">สรุปรวม</span>
                                <span className="font-bold text-lg text-blue-600">{formatCurrency(transportTotal)}</span>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">คงเหลือ</span>
                                <span className="font-bold text-lg text-red-600">{formatCurrency(transportRemaining)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>การดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button variant="outline" onClick={handleAddTransportRow}>เพิ่มแถว</Button>
                            <Button onClick={handleSaveTransportData}>บันทึกข้อมูล</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
