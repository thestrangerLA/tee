
"use client"

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Trash2, PlusCircle, DollarSign, ArrowDown, ArrowUp } from "lucide-react";
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MeatStockItem, MeatStockLog } from '@/lib/types';
import { listenToMeatStockItems, addMeatStockItem, deleteMeatStockItem, updateStockQuantity, listenToAllMeatStockLogs } from '@/services/meatStockService';
import { useClientRouter } from '@/hooks/useClientRouter';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};


const AddItemDialog = ({ onAddItem }: { onAddItem: (item: Omit<MeatStockItem, 'id'|'createdAt'>) => Promise<string> }) => {
    const { toast } = useToast();
    const router = useClientRouter();
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newItem = {
            sku: formData.get('sku') as string,
            name: formData.get('name') as string,
            packageSize: parseFloat(formData.get('packageSize') as string) || 1,
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
            currentStock: parseFloat(formData.get('currentStock') as string) || 0,
        };

        if (!newItem.sku || !newItem.name) {
             toast({ title: "Error", description: "Please fill in SKU and Name.", variant: "destructive" });
             return;
        }

        try {
            const newItemId = await onAddItem(newItem);
            toast({ title: "Success", description: "New item added to stock." });
            setOpen(false);
            e.currentTarget.reset();
            router.push(`/meat-business/stock/${newItemId}`);
        } catch (error) {
            console.error("Error adding item:", error);
            toast({ title: "Error", description: "Could not add item.", variant: "destructive" });
        }
    }

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>ເພີ່ມສິນຄ້າ</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>ເພີ່ມສິນຄ້າໃໝ່</DialogTitle>
                        <DialogDescription>
                           ປ້ອນລາຍລະອຽດຂອງຊີ້ນແພັກໃໝ່.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU/Code</Label>
                            <Input id="sku" name="sku" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="name">ປະເພດ / ສ່ວນຂອງຊີ້ນ</Label>
                            <Input id="name" name="name" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="packageSize">ຂະໜາດບັນຈຸ (kg/ຖົງ)</Label>
                            <Input id="packageSize" name="packageSize" type="number" step="0.01" defaultValue="1" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="costPrice">ຕົ້ນทุน (ຕໍ່ kg)</Label>
                            <Input id="costPrice" name="costPrice" type="number" step="0.01" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="sellingPrice">ລາຄາຂາຍ (ຕໍ່ kg)</Label>
                            <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="currentStock">ຈຳນວນນຳເຂົ້າສະຕັອກ (ຖົງ)</Label>
                            <Input id="currentStock" name="currentStock" type="number" step="0.01" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>ຍົກເລີກ</Button>
                        <Button type="submit">ບັນທຶກ ແລະ ເປີດໜ້າລາຍລະອຽດ</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const StockAdjustmentDialog = ({ 
    item, 
    onAdjust, 
    type 
}: { 
    item: MeatStockItem, 
    onAdjust: (id: string, change: number, type: 'stock-in' | 'sale', detail: string) => Promise<void>,
    type: 'stock-in' | 'sale'
}) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [detail, setDetail] = useState('');

    const handleAdjust = async () => {
        if (quantity <= 0) {
            toast({ title: "Invalid Quantity", variant: "destructive" });
            return;
        }
        const change = type === 'sale' ? -quantity : quantity;
        try {
            await onAdjust(item.id, change, type, detail);
            toast({ title: "Stock updated successfully" });
            setOpen(false);
            setQuantity(0);
            setDetail('');
        } catch (error: any) {
            console.error("Error adjusting stock:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={type === 'stock-in' ? 'outline' : 'destructive'} size="sm" className="h-8">
                     {type === 'stock-in' ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                    {type === 'stock-in' ? 'ຮັບເຂົ້າ' : 'ຂາຍອອກ'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{type === 'stock-in' ? 'ຮັບສິນຄ້າເຂົ້າ' : 'ຂາຍສິນຄ້າອອກ'}: {item.name}</DialogTitle>
                    <DialogDescription>ບັນທຶກການເຄື່ອນໄຫວສິນຄ້າ.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                        <Label htmlFor="quantity">ຈຳນວນ (ຖົງ)</Label>
                        <Input id="quantity" type="number" value={quantity || ''} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="detail">{type === 'sale' ? 'ລູກຄ້າ (ຖ້າມີ)' : 'ລາຍລະອຽດການນຳເຂົ້າ'}</Label>
                        <Input id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>ຍົກເລີກ</Button>
                    <Button onClick={handleAdjust}>ບັນທຶກ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function MeatStockPage() {
    const [stockItems, setStockItems] = useState<MeatStockItem[]>([]);
    const [stockLogs, setStockLogs] = useState<MeatStockLog[]>([]);
    
    useEffect(() => {
        const unsubscribeItems = listenToMeatStockItems(setStockItems);
        const unsubscribeLogs = listenToAllMeatStockLogs(setStockLogs);
        return () => {
            unsubscribeItems();
            unsubscribeLogs();
        }
    }, []);
    
    const totalStockValue = useMemo(() => {
        return stockItems.reduce((acc, item) => acc + (item.costPrice * item.currentStock * item.packageSize), 0);
    }, [stockItems]);

    const itemMovement = useMemo(() => {
        const movements: Record<string, { stockIn: number, stockOut: number }> = {};
        stockItems.forEach(item => {
            movements[item.id] = { stockIn: 0, stockOut: 0 };
        });

        stockLogs.forEach(log => {
            if (movements[log.itemId]) {
                if (log.type === 'stock-in') {
                    movements[log.itemId].stockIn += log.change;
                } else if (log.type === 'sale') {
                    movements[log.itemId].stockOut += Math.abs(log.change);
                }
            }
        });
        return movements;
    }, [stockItems, stockLogs]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/meat-business">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຈັດການສະຕັອກ (ທຸລະກິດຊີ້ນ)</h1>
                </div>
                 <div className="ml-auto">
                    <AddItemDialog onAddItem={addMeatStockItem} />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <div className="grid gap-4 md:grid-cols-1">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ມູນຄ່າສະຕັອກທັງໝົດ</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalStockValue)} KIP</div>
                            <p className="text-xs text-muted-foreground">ມູນຄ່າລວມຂອງສິນຄ້າທັງໝົດໃນຄັງ</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>ລາຍການສິນຄ້າໃນຄັງ</CardTitle>
                        <CardDescription>ຕິດຕາມ ແລະ ຈັດການສະຕັອກຊີ້ນຂອງທ່ານ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>ຊື່ສິນຄ້າ</TableHead>
                                    <TableHead className="text-right">ຂະໜາດບັນຈຸ (kg/ຖົງ)</TableHead>
                                    <TableHead className="text-right">ຮັບເຂົ້າ (ຖົງ)</TableHead>
                                    <TableHead className="text-right">ຂາຍອອກ (ຖົງ)</TableHead>
                                    <TableHead className="text-right">ຈຳນວນຄົງເຫຼືອ (ຖົງ)</TableHead>
                                    <TableHead className="text-right">ລວມທັງໝົດ (kg)</TableHead>
                                    <TableHead className="text-right">ມູນຄ່າລວມ</TableHead>
                                    <TableHead className="text-center">ຈັດການ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockItems.length > 0 ? stockItems.map(item => {
                                    const movements = itemMovement[item.id] || { stockIn: 0, stockOut: 0 };
                                    const totalUnits = item.currentStock * item.packageSize;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono">{item.sku}</TableCell>
                                            <TableCell className="font-medium hover:underline">
                                                <Link href={`/meat-business/stock/${item.id}`}>
                                                   {item.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right">{item.packageSize}</TableCell>
                                            <TableCell className="text-right text-green-600">{movements.stockIn}</TableCell>
                                            <TableCell className="text-right text-red-600">{movements.stockOut}</TableCell>
                                            <TableCell className="text-right font-bold">{item.currentStock}</TableCell>
                                            <TableCell className="text-right font-bold text-blue-600">{totalUnits.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.costPrice * totalUnits)}</TableCell>
                                            <TableCell className="text-center space-x-2">
                                                <StockAdjustmentDialog item={item} onAdjust={updateStockQuantity} type="stock-in" />
                                                <StockAdjustmentDialog item={item} onAdjust={updateStockQuantity} type="sale" />
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                               This action cannot be undone. This will permanently delete the item and its logs.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMeatStockItem(item.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24">ບໍ່ມີຂໍ້ມູນສິນຄ້າ</TableCell>
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
