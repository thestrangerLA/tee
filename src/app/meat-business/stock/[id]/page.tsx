
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listenToMeatStockItem, listenToMeatStockLogs, updateMeatStockItem } from '@/services/meatStockService';
import type { MeatStockItem } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

export default function MeatStockDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [item, setItem] = useState<MeatStockItem | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<MeatStockItem>>({});

    useEffect(() => {
        if (!id) return;

        const unsubscribeItem = listenToMeatStockItem(id, (data) => {
            setItem(data);
            setEditData(data || {});
        });
        const unsubscribeLogs = listenToMeatStockLogs(id, setLogs);

        return () => {
            unsubscribeItem();
            unsubscribeLogs();
        };
    }, [id]);

    const handleSave = async () => {
        if (!id) return;
        try {
            await updateMeatStockItem(id, editData);
            toast({ title: "ອັບເດດສຳເລັດ" });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save item:", error);
            toast({ title: "ເກີດຂໍ້ຜິດພາດ", variant: "destructive" });
        }
    };
    
    if (!item) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 sm:px-6 md:gap-8">
                 <Skeleton className="h-14 w-full" />
                 <Skeleton className="h-[200px] w-full" />
                 <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/meat-business/stock">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າສະຕັອກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">{item.name} ({item.sku})</h1>
                </div>
                <div className="ml-auto">
                    {isEditing ? (
                        <Button onClick={handleSave} size="sm">ບັນທຶກ</Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} size="sm" variant="outline"><Edit className="mr-2 h-4 w-4" />ແກ້ໄຂ</Button>
                    )}
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>ລາຍລະອຽດສິນຄ້າ</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        <div className="grid gap-2">
                            <Label>ຊື່ສິນຄ້າ</Label>
                            <Input value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} disabled={!isEditing} />
                        </div>
                        <div className="grid gap-2">
                            <Label>ຂະໜາດບັນຈຸ</Label>
                            <Input value={editData.packageSize || ''} onChange={(e) => setEditData({...editData, packageSize: e.target.value})} disabled={!isEditing} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Supplier</Label>
                            <Input value={editData.supplier || ''} onChange={(e) => setEditData({...editData, supplier: e.target.value})} disabled={!isEditing} />
                        </div>
                        <div className="grid gap-2">
                            <Label>ຕົ້ນทุน</Label>
                            <Input type="number" value={editData.costPrice || ''} onChange={(e) => setEditData({...editData, costPrice: parseFloat(e.target.value) || 0})} disabled={!isEditing} />
                        </div>
                         <div className="grid gap-2">
                            <Label>ລາຄາຂາຍ</Label>
                            <Input type="number" value={editData.sellingPrice || ''} onChange={(e) => setEditData({...editData, sellingPrice: parseFloat(e.target.value) || 0})} disabled={!isEditing} />
                        </div>
                         <div className="grid gap-2">
                            <Label>ຈຸດແຈ້ງເຕືອນສະຕັອກຕໍ່າ</Label>
                            <Input type="number" value={editData.lowStockThreshold || ''} onChange={(e) => setEditData({...editData, lowStockThreshold: parseInt(e.target.value) || 0})} disabled={!isEditing} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ປະຫວັດການເຄື່ອນໄຫວສະຕັອກ</CardTitle>
                        <CardDescription>ສະແດງທຸກການນຳເຂົ້າ ແລະ ການຂາຍຂອງສິນค้านี้</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ວັນທີ</TableHead>
                                    <TableHead>ປະເພດ</TableHead>
                                    <TableHead>ລາຍລະອຽດ</TableHead>
                                    <TableHead className="text-right">ຈຳນວນປ່ຽນແປງ</TableHead>
                                    <TableHead className="text-right">ຈຳນວນຄົງເຫຼືອ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{format(log.createdAt, 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell>
                                            <Badge variant={log.type === 'sale' ? 'destructive' : 'secondary'}>
                                                {log.type === 'sale' ? 'ຂາຍອອກ' : 'ນຳເຂົ້າ'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.detail}</TableCell>
                                        <TableCell className={`text-right font-medium ${log.change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {log.change}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{log.newStock}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">ບໍ່ມີປະຫວັດການເຄື່ອນໄຫວ</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

// Statically generate this page if needed, for now we keep it dynamic
export const dynamic = 'force-dynamic';
