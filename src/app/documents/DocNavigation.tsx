'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Book, FileText, Settings, Database, ShieldAlert, ScrollText } from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Overview', slug: '', icon: Book },
    { name: 'User Guide', slug: 'USER_GUIDE', icon: FileText },
    { name: 'Developer Guide', slug: 'DEVELOPER_GUIDE', icon: Settings },
    { name: 'Dialect Support', slug: 'DIALECTS', icon: Database },
    { name: 'Troubleshooting', slug: 'TROUBLESHOOTING', icon: ShieldAlert },
    { name: 'Release Notes', slug: '../RELEASE_NOTES', icon: ScrollText },
];

export default function DocNavigation() {
    const pathname = usePathname();

    return (
        <nav className="space-y-1">
            {MENU_ITEMS.map((item) => {
                const href = item.slug === ''
                    ? '/documents'
                    : item.slug.startsWith('../')
                        ? `/${item.slug.replace('../', '')}`
                        : `/documents/${item.slug}`;

                // Normalize paths to ignore .html and trailing slashes for reliable matching
                const normalize = (p: string) => p.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
                const isActive = normalize(pathname).toLowerCase() === normalize(href).toLowerCase();

                return (
                    <Link
                        key={item.slug}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group border border-transparent",
                            isActive
                                ? "bg-accent text-white shadow-lg shadow-accent/20 border-accent scale-[1.02] z-10"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-white" : "text-muted-foreground group-hover:text-accent"
                        )} />
                        <span className={cn(
                            "text-sm font-bold transition-all",
                            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                        )}>
                            {item.name}
                        </span>
                        {isActive && (
                            <div className="ml-auto w-1 h-4 bg-white/40 rounded-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
