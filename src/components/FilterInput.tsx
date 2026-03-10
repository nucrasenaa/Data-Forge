'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Columns, Type, Hash, Calendar, Binary, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    columns: string[];
    placeholder?: string;
    autoFocus?: boolean;
}

const SQL_KEYWORDS = [
    'AND', 'OR', 'NOT',
    'IS NULL', 'IS NOT NULL',
    'LIKE', 'IN', 'BETWEEN',
    'ORDER BY', 'GROUP BY',
    'EXISTS', 'DISTINCT'
];

const OPERATORS = [
    '=', '!=', '<>', '>', '<', '>=', '<='
];

export default function FilterInput({
    value,
    onChange,
    onSubmit,
    columns,
    placeholder = "WHERE...",
    autoFocus = false
}: FilterInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<{ label: string; type: 'column' | 'keyword' | 'operator' }[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get the word being typed at the cursor position
    const getActiveWord = () => {
        if (!inputRef.current) return '';
        const cursorPos = inputRef.current.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        const words = textBeforeCursor.split(/[\s()]+/);
        return words[words.length - 1];
    };

    useEffect(() => {
        const word = getActiveWord().toUpperCase();

        if (word.length >= 0 && showSuggestions) {
            const columnSuggestions = columns
                .filter(col => col.toUpperCase().includes(word))
                .map(col => ({ label: col, type: 'column' as const }));

            const keywordSuggestions = SQL_KEYWORDS
                .filter(ky => ky.includes(word))
                .map(ky => ({ label: ky, type: 'keyword' as const }));

            const operatorSuggestions = OPERATORS
                .filter(op => op.includes(word))
                .map(op => ({ label: op, type: 'operator' as const }));

            const allSuggestions = [...columnSuggestions, ...keywordSuggestions, ...operatorSuggestions];
            setSuggestions(allSuggestions);
            setSelectedIndex(0);
        } else {
            setSuggestions([]);
        }
    }, [value, columns, showSuggestions]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (suggestion: string) => {
        if (!inputRef.current) return;
        const cursorPos = inputRef.current.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        const textAfterCursor = value.substring(cursorPos);

        const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
        const lastBracketIndex = textBeforeCursor.lastIndexOf('(');
        const splitIndex = Math.max(lastSpaceIndex, lastBracketIndex);

        const newTask = textBeforeCursor.substring(0, splitIndex + 1) + suggestion + ' ' + textAfterCursor;
        onChange(newTask);
        setShowSuggestions(false);

        // Focus and set cursor
        setTimeout(() => {
            if (inputRef.current) {
                const newPos = splitIndex + 1 + suggestion.length + 1;
                inputRef.current.focus();
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 10);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleSelectSuggestion(suggestions[selectedIndex].label);
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        } else if (e.key === 'Enter') {
            onSubmit(e);
        }
    };

    return (
        <div className="relative flex-1 md:max-w-md group" ref={containerRef}>
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground opacity-50" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    className="w-full bg-muted/50 border border-border/50 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    autoFocus={autoFocus}
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden glass z-50 animate-in slide-in-from-top-2 fade-in max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="p-1 px-2 border-b border-border/50 bg-muted/30">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Suggestions</span>
                    </div>
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={`${suggestion.label}-${index}`}
                            onClick={() => handleSelectSuggestion(suggestion.label)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-xs font-mono transition-all text-left",
                                index === selectedIndex ? "bg-accent text-accent-foreground shadow-lg scale-[1.02] z-10" : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded flex items-center justify-center shrink-0",
                                suggestion.type === 'column' ? "bg-blue-500/10 text-blue-400" :
                                    suggestion.type === 'keyword' ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"
                            )}>
                                {suggestion.type === 'column' ? <Columns className="w-3 h-3" /> :
                                    suggestion.type === 'keyword' ? <Terminal className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                            </div>
                            <span className="flex-1 truncate">{suggestion.label}</span>
                            <span className="text-[9px] opacity-40 uppercase font-black tracking-widest">{suggestion.type}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
