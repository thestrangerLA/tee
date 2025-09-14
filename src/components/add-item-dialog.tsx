
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
  onAddItem: (item: Omit<StockItem, 'id'>) => Promise<void>;
  categories: string[];
}

export function AddItemDialog({ open, onOpenChange, onAddItem, categories }: AddItemDialogProps) {
    const { toast } = useToast()
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const currentStock = parseInt(formData.get('currentStock') as string, 10) || 0;
        const newItem: Omit<StockItem, 'id'> = {
            name: formData.get('name') as string,
            category: selectedCategory,
            currentStock: currentStock,
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            costPriceBaht: parseFloat(formData.get('costPriceBaht') as string) || 0,
            wholesalePrice: parseFloat(formData.get('wholesalePrice') as string) || 0,
            sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
        };

        if (!newItem.category) {
            toast({
                title: "ຂໍ້ຜິດພາດ",
                description: "ກະລຸນາເລືອກໝວດໝູ່",
                variant: "destructive",
            });
            return;
        }

        try {
            await onAddItem(newItem);
            toast({
                title: "ສຳເລັດ!",
                description: "ເພີ່ມລາຍການໃໝ່ໃນສະຕັອກສຳເລັດແລ້ວ",
                variant: "default",
            });
            onOpenChange(false);
            (event.currentTarget as HTMLFormElement).reset();
            setSelectedCategory("");
        } catch (error) {
            toast({
                title: "ເກີດຂໍ້ຜິດພາດ",
                description: "ບໍ່ສາມາດເພີ່ມລາຍການໄດ້, ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
                variant: "destructive",
            });
            console.error("Error adding item: ", error);
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>ເພີ່ມລາຍການໃໝ່</DialogTitle>
                <DialogDescription>
                    ປ້ອນລາຍລະອຽດດ້ານລຸ່ມເພື່ອເພີ່ມສິນຄ້າໃໝ່ເຂົ້າໃນສະຕັອກຂອງທ່ານ
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">ຊື່</Label>
                    <Input id="name" name="name" placeholder="ເຊັ່ນ: ຝຸ່ນຍີ່ຫໍ້ A" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">ໝວດໝູ່</Label>
                    <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="ເລືອກໝວດໝູ່" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...categories, "ຝຸ່ນ", "ແນວພັນ", "ຢາພືດ", "ຢາສັດ", "ອຸປະກອນ", "ເຂົ້າ", "ຫົວອາຫານ", "ວິຕາມິນ"].filter((v, i, a) => a.indexOf(v) === i).sort().map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currentStock" className="text-right">ສະຕັອກປັດຈຸບັນ</Label>
                    <Input id="currentStock" name="currentStock" type="number" placeholder="0" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="costPrice" className="text-right">ລາຄາຕົ້ນທຶນ (ກີບ)</Label>
                    <Input id="costPrice" name="costPrice" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="costPriceBaht" className="text-right">ລາຄາຕົ້ນທຶນ (ບາດ)</Label>
                    <Input id="costPriceBaht" name="costPriceBaht" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="wholesalePrice" className="text-right">ລາຄາຂາຍສົ່ງ</Label>
                    <Input id="wholesalePrice" name="wholesalePrice" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sellingPrice" className="text-right">ລາຄາຂາຍຍ່ອຍ</Label>
                    <Input id="sellingPrice" name="sellingPrice" type="number" placeholder="0.00" step="0.01" className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ຍົກເລີກ</Button>
                <Button type="submit">ບັນທຶກລາຍການ</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
