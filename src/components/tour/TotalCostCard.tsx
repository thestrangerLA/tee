
"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';
const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລár)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export const TotalCostCard = ({ totalsByCategory }: { totalsByCategory: any }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ສະຫຼຸບຄ່າໃຊ້ຈ່າຍແຕ່ລະປະເພດ</CardTitle>
                <CardDescription>ລວມຄ່າໃຊ້ຈ່າຍທັງໝົດແຍກຕາມປະເພດ ແລະ ສະກຸນເງິນ</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ປະເພດຄ່າໃຊ້ຈ່າຍ</TableHead>
                            <TableHead className="text-right">USD</TableHead>
                            <TableHead className="text-right">THB</TableHead>
                            <TableHead className="text-right">LAK</TableHead>
                            <TableHead className="text-right">CNY</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(totalsByCategory).map(([category, totals]) => (
                            <TableRow key={category}>
                                <TableCell className="font-semibold">{category}</TableCell>
                                {(Object.keys(currencySymbols) as Currency[]).map(currency => (
                                    <TableCell key={currency} className="text-right">
                                        {formatNumber((totals as any)[currency] || 0)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
