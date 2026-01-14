import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ResponsiveLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <ScrollArea className="h-full">
                    <Sidebar />
                </ScrollArea>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                <div className="flex h-16 items-center border-b bg-background px-4 md:hidden">
                    <MobileNav />
                    <span className="ml-2 font-bold">App</span>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
