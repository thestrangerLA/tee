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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { StockItem } from "@/lib/types"

type RecordTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: StockItem[];
}

export function RecordTransactionDialog({ open, onOpenChange, items }: RecordTransactionDialogProps) {
  const { toast } = useToast()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toast({
            title: "Success!",
            description: "Transaction has been recorded.",
            variant: "default",
        });
        onOpenChange(false);
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>
                Select an item and record a new purchase or sale.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item" className="text-right">Product</Label>
                <Select required>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                 <RadioGroup defaultValue="purchase" className="col-span-3 flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="purchase" id="purchase" />
                        <Label htmlFor="purchase">Purchase</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sale" id="sale" />
                        <Label htmlFor="sale">Sale</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                Quantity
                </Label>
                <Input id="quantity" type="number" placeholder="0" className="col-span-3" required />
            </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Record</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
