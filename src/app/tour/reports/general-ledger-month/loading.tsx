
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="ml-auto">
                <Skeleton className="h-8 w-20" />
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Skeleton className="h-[500px] w-full" />
        </main>
    </div>
  )
}
