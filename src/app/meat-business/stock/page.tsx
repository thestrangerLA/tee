
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
import { ArrowLeft, Package, Trash2, PlusCircle, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
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

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MeatStockItem } from '@/lib/types';
import { listenToMeatStockItems, addMeatStockItem, deleteMeatStockItem, updateStockQuantity } from '@/services/meatStockService';
import { format, differenceInDays, isBefore, startOfToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useClientRouter } from '@/hooks/useClientRouter';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};


const AddItemDialog = ({ onAddItem }: { onAddItem: (item: Omit<MeatStockItem, 'id'|'createdAt'>) => Promise<string> }) => {
    const { toast } = useToast();
    const router = useClientRouter();
    const [open, setOpen] = useState(false);
    const [expiryDate, setExpiryDate] = useState<Date | undefined>();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newItem = {
            sku: formData.get('sku') as string,
            name: formData.get('name') as string,
            packageSize: formData.get('packageSize') as string,
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
            currentStock: parseFloat(formData.get('currentStock') as string) || 0,
            lowStockThreshold: parseFloat(formData.get('lowStockThreshold') as string) || 5,
            expiryDate: expiryDate || null,
            supplier: formData.get('supplier') as string || '',
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
            setExpiryDate(undefined);
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
                            <Label htmlFor="packageSize">ຂະໜາດບັນຈຸ</Label>
                            <Input id="packageSize" name="packageSize" placeholder="e.g., 500g, 1kg" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="expiryDate">ວັນໝົດອາຍຸ</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className="justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {expiryDate ? format(expiryDate, "PPP") : <span>ເລືອກວັນທີ</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} /></PopoverContent>
                            </Popover>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="costPrice">ຕົ້ນทุน</Label>
                            <Input id="costPrice" name="costPrice" type="number" step="0.01" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="sellingPrice">ລາຄາຂາຍ</Label>
                            <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="currentStock">ຈຳນວນນຳເຂົ້າສະຕັອກ</Label>
                            <Input id="currentStock" name="currentStock" type="number" step="0.01" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="lowStockThreshold">ຈຸດແຈ້ງເຕືອນສະຕັອກຕໍ່າ</Label>
                            <Input id="lowStockThreshold" name="lowStockThreshold" type="number" defaultValue="5" />
                        </div>
                         <div className="grid gap-2 col-span-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input id="supplier" name="supplier" />
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

const StockAdjustmentDialog = ({ item, onAdjust }: { item: MeatStockItem, onAdjust: (id: string, change: number, type: 'stock-in' | 'sale', detail: string) => Promise<void> }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [type, setType] = useState<'stock-in' | 'sale'>('sale');
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
                <Button variant="outline" size="sm">ປັບປຸງ</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ປັບປຸງສະຕັອກ: {item.name}</DialogTitle>
                    <DialogDescription>ບັນທຶກການນຳເຂົ້າ ຫຼື ການຂາຍ.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant={type === 'sale' ? 'default' : 'outline'} onClick={() => setType('sale')}>ຂາຍອອກ</Button>
                        <Button variant={type === 'stock-in' ? 'default' : 'outline'} onClick={() => setType('stock-in')}>ນຳເຂົ້າ</Button>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="quantity">ຈຳນວນ ({item.packageSize})</Label>
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

const ExpiryStatusBadge = ({ expiryDate }: { expiryDate: Date | null }) => {
    if (!expiryDate) {
        return <Badge variant="secondary">ບໍ່ມີຂໍ້ມູນ</Badge>;
    }
    const today = startOfToday();
    const daysUntilExpiry = differenceInDays(expiryDate, today);

    if (isBefore(expiryDate, today)) {
        return <Badge variant="destructive">ໝົດອາຍຸແລ້ວ</Badge>;
    }
    if (daysUntilExpiry <= 3) {
        return <Badge className="bg-orange-500 text-white">ໃກ້ໝົດອາຍຸ</Badge>;
    }
    if (daysUntilExpiry <= 7) {
        return <Badge className="bg-yellow-500 text-white">ໃກ້ໝົດອາຍຸ</Badge>;
    }
    return <Badge variant="outline">ສົດ</Badge>;
}


export default function MeatStockPage() {
    const [stockItems, setStockItems] = useState<MeatStockItem[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = listenToMeatStockItems(setStockItems);
        return () => unsubscribe();
    }, []);
    
    const totalStockValue = useMemo(() => {
        return stockItems.reduce((acc, item) => acc + (item.costPrice * item.currentStock), 0);
    }, [stockItems]);

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
                                    <TableHead>ສະຖານະ</TableHead>
                                    <TableHead className="text-right">ຈຳນວນ (ຄົງເຫຼືອ)</TableHead>
                                    <TableHead className="text-right">ຕົ້ນທຶນ</TableHead>
                                    <TableHead className="text-right">ລາຄາຂາຍ</TableHead>
                                    <TableHead className="text-right">ມູນຄ່າລວມ</TableHead>
                                    <TableHead className="text-center">ຈັດການ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockItems.length > 0 ? stockItems.map(item => {
                                    const isLowStock = item.currentStock <= item.lowStockThreshold;
                                    return (
                                        <TableRow key={item.id} className={isLowStock ? 'bg-orange-50' : ''}>
                                            <TableCell className="font-mono">{item.sku}</TableCell>
                                            <TableCell className="font-medium hover:underline">
                                                <Link href={`/meat-business/stock/${item.id}`}>
                                                   {item.name} ({item.packageSize})
                                                </Link>
                                            </TableCell>
                                            <TableCell><ExpiryStatusBadge expiryDate={item.expiryDate} /></TableCell>
                                            <TableCell className={`text-right font-bold ${isLowStock ? 'text-orange-600' : ''}`}>{item.currentStock}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.sellingPrice)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.costPrice * item.currentStock)}</TableCell>
                                            <TableCell className="text-center space-x-2">
                                                <StockAdjustmentDialog item={item} onAdjust={updateStockQuantity} />
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
                                        <TableCell colSpan={8} className="text-center h-24">ບໍ່ມີຂໍ້ມູນສິນຄ້າ</TableCell>
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
