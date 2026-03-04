
'use client';

import React, { useEffect, useState } from 'react';
import { getBookmarks, deleteBookmark, BookmarkItem } from '@/lib/history';
import { Search, Bookmark, Trash2, Play, Copy, Check, Filter, Tags, Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkPanelProps {
    onSelectQuery: (sql: string) => void;
}

export default function BookmarkPanel({ onSelectQuery }: BookmarkPanelProps) {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        setBookmarks(getBookmarks());
    }, []);

    const filteredBookmarks = bookmarks.filter(item =>
        item.sql.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCopy = (sql: string, id: string) => {
        navigator.clipboard.writeText(sql);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this bookmark?')) {
            deleteBookmark(id);
            setBookmarks(prev => prev.filter(b => b.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Query Bookmarks</span>
                    </div>
                </div>

                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            className="w-full bg-muted/30 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {filteredBookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center space-y-4 border-2 border-dashed border-border rounded-3xl">
                        <Package className="w-12 h-12 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No saved queries found</p>
                    </div>
                ) : (
                    filteredBookmarks.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelectQuery(item.sql)}
                            className="group relative border border-border/50 rounded-2xl bg-card hover:border-amber-500/30 transition-all overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-amber-500/5"
                        >
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 shrink-0" />
                                        <span className="text-xs font-black uppercase tracking-widest truncate">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopy(item.sql, item.id); }}
                                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all"
                                            title="Copy SQL"
                                        >
                                            {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
                                            title="Delete Bookmark"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {item.category && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/30 w-fit px-2 py-0.5 rounded-full border border-border/50">
                                        <Tags className="w-2.5 h-2.5" />
                                        {item.category}
                                    </div>
                                )}

                                <div className="text-[10px] font-mono text-emerald-400 group-hover:text-emerald-300 opacity-60 group-hover:opacity-100 transition-all line-clamp-3 bg-[#111] p-3 rounded-xl border border-white/5">
                                    {item.sql}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
