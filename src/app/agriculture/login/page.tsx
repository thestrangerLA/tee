
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Leaf } from "lucide-react";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


export default function AgricultureLoginPage() {
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'qwe') {
            sessionStorage.setItem('agriculture-auth', 'true');
            router.push('/agriculture');
        } else {
            toast({
                title: "รหัสผ่านไม่ถูกต้อง",
                description: "กรุณาลองใหม่อีกครั้ง",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
             <div className="absolute top-4 left-4">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้าหลัก</span>
                    </Link>
                </Button>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                         <Leaf className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline">ເຂົ້າສູ່ລະບົບທຸລະກິດກະສິກຳ</CardTitle>
                    <CardDescription>ກະລຸນາປ້ອນລະຫັດຜ່ານເພື່ອເຂົ້າໃຊ້ງານ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            ເຂົ້າສູ່ລະບົບ
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
