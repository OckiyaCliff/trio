'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings } from 'lucide-react'
import Dock, { type DockItemData } from './dock'

interface MobileDockProps {
    items: { label: string; href: string; icon: React.ReactNode }[]
}

export function MobileDock({ items }: MobileDockProps) {
    const pathname = usePathname()
    const router = useRouter()

    const dockItems: DockItemData[] = items.map((item) => ({
        icon: item.icon,
        label: item.label,
        onClick: () => router.push(item.href),
        className: pathname === item.href || pathname.startsWith(`${item.href}/`)
            ? 'bg-accent border-primary/20'
            : '',
    }))

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <Dock
                items={dockItems}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
            />
        </div>
    )
}
