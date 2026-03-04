'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QueryEditor from '@/components/QueryEditor';
import DataTable from '@/components/DataTable';
import ExecutionPlan from '@/components/ExecutionPlan';
import ERDiagram from '@/components/ERDiagram';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Terminal, Database, Loader2, AlertCircle } from 'lucide-react';

interface ResultSet {
    data: any[];
    columns: string[];
    totalRows: number;
}

function PopoutContent() {
    const searchParams = useSearchParams();

    const [config, setConfig] = useState<any>(null);
    const [tabInfo, setTabInfo] = useState<any>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Query state
    const [sqlQuery, setSqlQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [queryResult, setQueryResult] = useState<ResultSet>({ data: [], columns: [], totalRows: 0 });
    const [resultSets, setResultSets] = useState<ResultSet[]>([]);
    const [activeResultSetIndex, setActiveResultSetIndex] = useState(0);
    const [executionPlan, setExecutionPlan] = useState<any[]>([]);
    const [showPlan, setShowPlan] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const [sortColumn, setSortColumn] = useState<string | undefined>();
    const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');

    // Load state from sessionStorage on mount
    useEffect(() => {
        const windowId = searchParams.get('id');
        if (!windowId) {
            setError('No window ID provided.');
            return;
        }

        try {
            const storedConfig = sessionStorage.getItem(`popout_config_${windowId}`);
            const storedTab = sessionStorage.getItem(`popout_tab_${windowId}`);

            if (!storedConfig) {
                setError('Connection config not found. Please re-open this window from the main app.');
                return;
            }

            const parsedConfig = JSON.parse(storedConfig);
            const parsedTab = storedTab ? JSON.parse(storedTab) : null;

            setConfig(parsedConfig);
            setTabInfo(parsedTab);

            if (parsedTab?.sqlQuery) setSqlQuery(parsedTab.sqlQuery);
            if (parsedTab?.queryResult) setQueryResult(parsedTab.queryResult);
            if (parsedTab?.resultSets) setResultSets(parsedTab.resultSets);
            if (parsedTab?.executionPlan) setExecutionPlan(parsedTab.executionPlan);
        } catch {
            setError('Failed to load window data. Please re-open from the main app.');
        }
    }, [searchParams]);

    // Load metadata once config is available
    useEffect(() => {
        if (!config) return;
        apiRequest('/api/db/metadata', 'POST', config)
            .then(res => { if (res.success) setMetadata(res.metadata); })
            .catch(() => { });
    }, [config]);

    // Update title
    useEffect(() => {
        if (tabInfo?.title) {
            document.title = `${tabInfo.title} — Data Forge`;
        }
    }, [tabInfo]);

    const executeQuery = useCallback(async (q: string, opts: any = {}) => {
        if (!config || !q.trim()) return;

        const p = opts.p || 1;
        const pSize = opts.pSize || pageSize;
        const sortCol = opts.sortCol || sortColumn;
        const sortD = opts.sortD || sortDir;

        setLoading(true);
        setPage(p);

        try {
            const res = await apiRequest('/api/db/query', 'POST', {
                config,
                query: q,
                page: p,
                pageSize: pSize,
                orderBy: sortCol,
                orderDir: sortD,
                includeCount: true
            });

            if (res.isMultiSet && res.resultSets) {
                setResultSets(res.resultSets);
                setActiveResultSetIndex(0);
                setQueryResult(res.resultSets[0] || { data: [], columns: [], totalRows: 0 });
                setShowPlan(false);
            } else {
                setQueryResult({ data: res.data || [], columns: res.columns || [], totalRows: res.totalRows || 0 });
                setResultSets([]);
                setShowPlan(false);
            }
        } catch {
            setQueryResult({ data: [], columns: ['Error'], totalRows: 0 });
        } finally {
            setLoading(false);
        }
    }, [config, pageSize, sortColumn, sortDir]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <div className="p-4 bg-red-500/10 rounded-full">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-sm font-bold text-muted-foreground text-center max-w-sm">{error}</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Session...</p>
            </div>
        );
    }

    const tabType = tabInfo?.type || 'query';
    const dialect = config?.dbType || 'mssql';

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Compact header */}
            <header className="h-10 border-b border-border bg-card/80 backdrop-blur-md flex items-center gap-3 px-4 shrink-0">
                <div className="flex items-center gap-2">
                    {tabType === 'query' ? <Terminal className="w-3.5 h-3.5 text-accent" /> : <Database className="w-3.5 h-3.5 text-accent" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tabInfo?.title || 'Popout'}</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">
                        {config.database || config.connectionString?.split('/').pop() || 'Connected'}
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-hidden flex flex-col min-h-0">
                {tabType === 'er-diagram' ? (
                    <ERDiagram config={config} />
                ) : (
                    // Default: Query editor + results
                    <div className="flex-1 flex flex-col min-h-0">
                        <QueryEditor
                            query={sqlQuery}
                            onQueryChange={setSqlQuery}
                            onExecute={(q) => executeQuery(q || sqlQuery)}
                            loading={loading}
                            metadata={metadata}
                            dbType={dialect}
                        />

                        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                            {/* Multi result set tabs */}
                            {resultSets.length > 1 && (
                                <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/20 shrink-0">
                                    {resultSets.map((rs, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setActiveResultSetIndex(i); setQueryResult(rs); }}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                                activeResultSetIndex === i
                                                    ? "bg-accent/10 text-accent border border-accent/20"
                                                    : "text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            Result {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showPlan && executionPlan.length > 0 ? (
                                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border-b border-border shrink-0">
                                        <button onClick={() => setShowPlan(false)} className="text-[9px] uppercase tracking-widest text-accent font-bold hover:opacity-70 transition-all">← Results</button>
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">/ Execution Plan</span>
                                    </div>
                                    <ExecutionPlan data={executionPlan} dialect={dialect} />
                                </div>
                            ) : (
                                <DataTable
                                    data={queryResult.data}
                                    columns={queryResult.columns}
                                    totalRows={queryResult.totalRows}
                                    loading={loading}
                                    page={page}
                                    pageSize={pageSize}
                                    onPageChange={(p) => executeQuery(sqlQuery, { p })}
                                    onPageSizeChange={(s) => { setPageSize(s); executeQuery(sqlQuery, { p: 1, pSize: s }); }}
                                    onSort={(col) => {
                                        const d = sortColumn === col && sortDir === 'ASC' ? 'DESC' : 'ASC';
                                        setSortColumn(col);
                                        setSortDir(d);
                                        executeQuery(sqlQuery, { sortCol: col, sortD: d });
                                    }}
                                    sortColumn={sortColumn}
                                    sortDir={sortDir}
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function PopoutPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        }>
            <PopoutContent />
        </Suspense>
    );
}
