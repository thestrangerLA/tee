
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";

export default function CostCalculatorPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/tour">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">ຄຳນວນຕົ້ນທຶນໂປຣແກຣມທົວ</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>ເຄື່ອງມືຄຳນວນຕົ້ນທຶນ</CardTitle>
                <CardDescription>ໜ້ານີ້ກຳລັງຢູ່ໃນການພັດທະນາ. ກະລຸນາໃຫ້ລະຫັດສຳລັບໜ້ານີ້.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-16">
                    <p>Placeholder for Cost Calculator</p>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
