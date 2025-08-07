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
import { useToast } from "@/hooks/use-toast"

type AddItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemDialog({ open, onOpenChange }: AddItemDialogProps) {
    const { toast } = useToast()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Here you would typically handle form submission, e.g., send data to a server.
        // For this demo, we'll just show a success toast.
        toast({
            title: "สำเร็จ!",
            description: "เพิ่มรายการใหม่ในสต็อกเรียบร้อยแล้ว",
            variant: "default",
        });
        onOpenChange(false);
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
                    <Input id="name" placeholder="เช่น ปุ๋ยยี่ห้อ A" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">หมวดหมู่</Label>
                    <Input id="category" placeholder="เช่น ปุ๋ย" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">สต็อกเปิด</Label>
                    <Input id="stock" type="number" placeholder="0" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="costPrice" className="text-right">ราคาต้นทุน</Label>
                    <Input id="costPrice" type="number" placeholder="0.00" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="wholesalePrice" className="text-right">ราคาขายส่ง</Label>
                    <Input id="wholesalePrice" type="number" placeholder="0.00" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sellingPrice" className="text-right">ราคาขายปลีก</Label>
                    <Input id="sellingPrice" type="number" placeholder="0.00" className="col-span-3" required />
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
