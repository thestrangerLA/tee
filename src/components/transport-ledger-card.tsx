
"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);
}

const TransportEntryRow = ({ row, onRowChange, onRowDelete, index }: { row: any, onRowChange: any, onRowDelete: any, index: number }) => (
    <TableRow>
        <TableCell className="p-1">
            <Input type="text" value={row.ans_date} onChange={(e) => onRowChange(index, 'ans_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.ans_amount || ''} onChange={(e) => onRowChange(index, 'ans_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="text" value={row.hal_date} onChange={(e) => onRowChange(index, 'hal_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.hal_amount || ''} onChange={(e) => onRowChange(index, 'hal_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="text" value={row.mx_date} onChange={(e) => onRowChange(index, 'mx_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.mx_amount || ''} onChange={(e) => onRowChange(index, 'mx_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
            <Button variant="ghost" size="icon" onClick={() => onRowDelete(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </TableCell>
    </TableRow>
);


export function TransportLedgerCard() {
    const { toast } = useToast();
    const [isTransportFormVisible, setTransportFormVisible] = useState(false);
    const [transportRows, setTransportRows] = useState([
        { ans_date: '', ans_amount: 0, hal_date: '', hal_amount: 0, mx_date: '', mx_amount: 0 }
    ]);
    
    const transportTotal = useMemo(() => {
        return transportRows.reduce((total, row) => {
            return total + (row.ans_amount || 0) + (row.hal_amount || 0) + (row.mx_amount || 0);
        }, 0);
    }, [transportRows]);

    const handleAddTransportRow = () => {
        setTransportRows([...transportRows, { ans_date: '', ans_amount: 0, hal_date: '', hal_amount: 0, mx_date: '', mx_amount: 0 }]);
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
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setTransportFormVisible(!isTransportFormVisible)}>
                    <CardTitle>บัญชีขนส่ง</CardTitle>
                    <Button variant="ghost" size="icon">
                        {isTransportFormVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        <span className="sr-only">Toggle Transport Form</span>
                    </Button>
                </div>
            </CardHeader>
            {isTransportFormVisible && (
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead colSpan={2} className="text-center border-r">ANS</TableHead>
                                    <TableHead colSpan={2} className="text-center border-r">HAL</TableHead>
                                    <TableHead colSpan={2} className="text-center border-r">MX</TableHead>
                                    <TableHead className="text-center">ลบ</TableHead>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="text-center">วันที่</TableHead>
                                    <TableHead className="text-center border-r">จำนวนเงิน</TableHead>
                                    <TableHead className="text-center">วันที่</TableHead>
                                    <TableHead className="text-center border-r">จำนวนเงิน</TableHead>
                                    <TableHead className="text-center">วันที่</TableHead>
                                    <TableHead className="text-center border-r">จำนวนเงิน</TableHead>
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
                    <div className="mt-4 flex flex-col gap-2">
                        <Button variant="outline" onClick={handleAddTransportRow}>เพิ่มแถว</Button>
                        <Button onClick={handleSaveTransportData}>บันทึกข้อมูล</Button>
                        <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                            <span className="font-semibold">สรุปรวม</span>
                            <span className="font-bold">{formatCurrency(transportTotal)}</span>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
