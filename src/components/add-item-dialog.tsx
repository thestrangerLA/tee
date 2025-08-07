
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { StockItem } from "@/lib/types"
import { useState } from "react"

type AddItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<StockItem, 'id' | 'openingStock'>) => void;
  categories: string[];
}

export function AddItemDialog({ open, onOpenChange, onAddItem, categories }: AddItemDialogProps) {
    const { toast } = useToast()
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const currentStock = parseInt(formData.get('currentStock') as string, 10) || 0;
        const newItem: Omit<StockItem, 'id'> = {
            name: formData.get('name') as string,
            category: selectedCategory,
            currentStock: currentStock,
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            wholesalePrice: parseFloat(formData.get('wholesalePrice') as string) || 0,
            sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
        };

        if (!newItem.category) {
            toast({
                title: "ข้อผิดพลาด",
                description: "กรุณาเลือกหมวดหมู่",
                variant: "destructive",
            });
            return;
        }

        onAddItem(newItem);

        toast({
            title: "สำเร็จ!",
            description: "เพิ่มรายการใหม่ในสต็อกเรียบร้อยแล้ว",
            variant: "default",
        });
        onOpenChange(false);
        event.currentTarget.reset();
        setSelectedCategory("");
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>เพิ่มรายการใหม่</DialogTitle>
                <DialogDescription>
                    กรอกรายละเอียดด้านล่างเพื่อเพิ่มสินค้าใหม่ลงในสต็อกของคุณ
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">ชื่อ</Label>
                    <Input id="name" name="name" placeholder="เช่น ปุ๋ยยี่ห้อ A" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">หมวดหมู่</Label>
                    <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...categories, "ยาพืช", "ยาสัตว์"].filter((v, i, a) => a.indexOf(v) === i).sort().map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currentStock" className="text-right">สต็อกปัจจุบัน</Label>
                    <Input id="currentStock" name="currentStock" type="number" placeholder="0" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="costPrice" className="text-right">ราคาต้นทุน</Label>
                    <Input id="costPrice" name="costPrice" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="wholesalePrice" className="text-right">ราคาขายส่ง</Label>
                    <Input id="wholesalePrice" name="wholesalePrice" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sellingPrice" className="text-right">ราคาขายปลีก</Label>
                    <Input id="sellingPrice" name="sellingPrice" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
                <Button type="submit">บันทึกรายการ</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
