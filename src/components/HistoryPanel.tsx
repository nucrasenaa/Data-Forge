
'use client';

import React, { useEffect, useState } from 'react';
import { getHistory, clearHistory, HistoryItem } from '@/lib/history';
import { Search, Clock, Trash2, Play, Copy, Check, Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
    onSelectQuery: (sql: string) => void;
}

export default function HistoryPanel({ onSelectQuery }: HistoryPanelProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const filteredHistory = history.filter(item =>
        item.sql.toLowerCase().includes(search.toLowerCase()) ||
        item.database.toLowerCase().includes(search.toLowerCase())
    );

    const handleCopy = (sql: string, id: string) => {
        navigator.clipboard.writeText(sql);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClear = () => {
        if (confirm('Clear all execution history?')) {
            clearHistory();
            setHistory([]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background animate-in slide-in-from-left-4 duration-300">
            <div className="p-4 border-b border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Query History</span>
                    </div>
                    <button
                        onClick={handleClear}
                        className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
                        title="Clear History"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="w-full bg-muted/30 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-2">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                        <Clock className="w-8 h-8 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">No history yet</span>
                    </div>
                ) : (
                    filteredHistory.map(item => (
                        <div key={item.id} className="group border border-border/50 rounded-2xl bg-card/30 hover:bg-card hover:border-accent/30 transition-all overflow-hidden glass">
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <Database className="w-3 h-3 text-muted-foreground shrink-0" />
                                        <span className="text-[9px] font-mono text-muted-foreground truncate">{item.database}</span>
                                        {!item.success && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground shrink-0 font-mono">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-[11px] font-mono text-foreground line-clamp-2 opacity-80 bg-black/20 p-2 rounded-lg break-all">
                                    {item.sql}
                                </div>
                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onSelectQuery(item.sql)}
                                        className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-accent/20"
                                    >
                                        <Play className="w-3 h-3" /> Re-run
                                    </button>
                                    <button
                                        onClick={() => handleCopy(item.sql, item.id)}
                                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all"
                                        title="Copy SQL"
                                    >
                                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
