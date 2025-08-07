import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
    isAction?: boolean;
}

export function StatCard({ title, value, icon, description, isAction = false }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {isAction ? (
                     <Button variant="outline" size="sm" className="mt-1">{value}</Button>
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
