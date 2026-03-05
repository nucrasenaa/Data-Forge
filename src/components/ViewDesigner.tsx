'use client';

import React, { useState, useEffect } from 'react';
import {
    Check,
    Trash2,
    Table,
    Play,
    Settings2,
    FileCode,
    Search,
    PlusCircle,
    Layers,
    Share2,
    Loader2,
    Key,
    Database,
    ChevronDown,
    Save,
    LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

interface ViewDesignerProps {
    metadata: any;
    config: any;
    database: string;
    databases?: any[];
    onExecute: (sql: string) => void;
    onClose: () => void;
    dbType: string;
}

interface ColumnInfo {
    name: string;
    type: string;
    isPK: boolean;
    isNullable: boolean;
}

export default function ViewDesigner({ metadata: initialMetadata, config, database, databases = [], onExecute, onClose, dbType }: ViewDesignerProps) {
    const [selectedDb, setSelectedDb] = useState(database);
    const [currentMetadata, setCurrentMetadata] = useState<any>(initialMetadata);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<Record<string, string[]>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [tableColumns, setTableColumns] = useState<Record<string, ColumnInfo[]>>({});
    const [loadingTable, setLoadingTable] = useState<string | null>(null);
    const [loadingMetadata, setLoadingMetadata] = useState(false);

    const [viewName, setViewName] = useState('');
    const [schema, setSchema] = useState(dbType === 'mssql' ? 'dbo' : (dbType === 'postgres' ? 'public' : ''));

    useEffect(() => {
        const fetchMetadata = async () => {
            if (selectedDb === database) {
                setCurrentMetadata(initialMetadata);
                return;
            }
            setLoadingMetadata(true);
            try {
                const res = await apiRequest('/api/db/metadata', 'POST', { ...config, database: selectedDb });
                if (res.success) {
                    setCurrentMetadata(res.metadata);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMetadata(false);
            }
        };
        fetchMetadata();
    }, [selectedDb, config, initialMetadata]);

    const fetchColumnsForTable = async (tableMeta: any) => {
        if (!config) return;
        const tableKey = tableMeta.name;
        if (tableColumns[tableKey]) return;

        setLoadingTable(tableKey);
        try {
            const dialect = config.dbType || 'mssql';
            let query = '';

            if (dialect === 'mysql' || dialect === 'mariadb') {
                const schemaName = tableMeta.schema || selectedDb || '';
                const tableName = tableMeta.name;
                query = `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'${schemaName ? ` AND TABLE_SCHEMA = '${schemaName}'` : ` AND TABLE_SCHEMA = DATABASE()`} ORDER BY ORDINAL_POSITION`;
            } else if (dialect === 'postgres') {
                const parts = (tableMeta.fullName || tableMeta.name).replace(/"/g, '').split('.');
                const schema = parts.length > 1 ? parts[0] : 'public';
                const tbl = parts[parts.length - 1];
                query = `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${tbl}' ORDER BY ordinal_position`;
            } else {
                const parts = (tableMeta.fullName || tableMeta.name).replace(/[\[\]]/g, '').split('.');
                const schema = parts.length > 1 ? parts[0] : 'dbo';
                const tbl = parts[parts.length - 1];
                query = `USE [${selectedDb}]; SELECT c.name AS COLUMN_NAME, ty.name AS DATA_TYPE, c.is_nullable AS IS_NULLABLE FROM sys.tables t JOIN sys.schemas s ON t.schema_id=s.schema_id JOIN sys.columns c ON t.object_id=c.object_id JOIN sys.types ty ON c.user_type_id=ty.user_type_id WHERE s.name='${schema}' AND t.name='${tbl}' ORDER BY c.column_id`;
            }

            const res = await apiRequest('/api/db/query', 'POST', { config: { ...config, database: selectedDb }, query, page: 1, pageSize: 500 });
            if (res.success && res.data) {
                const cols: ColumnInfo[] = res.data.map((row: any) => ({
                    name: String(row.COLUMN_NAME ?? row.column_name ?? row.Column ?? ''),
                    type: String(row.DATA_TYPE ?? row.data_type ?? row.Type ?? ''),
                    isPK: row.IS_PK === 1 || row.column_key === 'PRI',
                    isNullable: row.IS_NULLABLE === 'YES' || row.is_nullable === 1,
                }));
                setTableColumns(prev => ({ ...prev, [tableKey]: cols }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTable(null);
        }
    };

    const toggleTable = (tableMeta: any) => {
        const tableName = tableMeta.name;
        if (selectedTables.includes(tableName)) {
            setSelectedTables(prev => prev.filter(t => t !== tableName));
            const newCols = { ...selectedColumns };
            delete newCols[tableName];
            setSelectedColumns(newCols);
        } else {
            setSelectedTables(prev => [...prev, tableName]);
            setSelectedColumns(prev => ({ ...prev, [tableName]: [] }));
            fetchColumnsForTable(tableMeta);
        }
    };

    const toggleColumn = (tableName: string, column: string) => {
        const currentCols = selectedColumns[tableName] || [];
        if (currentCols.includes(column)) {
            setSelectedColumns({ ...selectedColumns, [tableName]: currentCols.filter(c => c !== column) });
        } else {
            setSelectedColumns({ ...selectedColumns, [tableName]: [...currentCols, column] });
        }
    };

    const generateSelectSql = () => {
        if (selectedTables.length === 0) return 'SELECT * FROM ...';

        const q = dbType === 'mssql' ? (s: string) => `[${s}]` : (s: string) => `"${s}"`;
        let sql = 'SELECT ';
        const columnsToSelect: string[] = [];

        selectedTables.forEach(t => {
            const cols = selectedColumns[t] || [];
            if (cols.length === 0) {
                columnsToSelect.push(`${q(t)}.*`);
            } else {
                cols.forEach(c => columnsToSelect.push(`${q(t)}.${q(c)}`));
            }
        });

        sql += columnsToSelect.join(',\n       ');
        sql += `\nFROM ${q(selectedTables[0])}`;

        if (selectedTables.length > 1) {
            for (let i = 1; i < selectedTables.length; i++) {
                sql += `\nCROSS JOIN ${q(selectedTables[i])}`;
            }
        }
        return sql;
    };

    const generateSql = () => {
        const q = dbType === 'mssql' ? (s: string) => `[${s}]` : (s: string) => `"${s}"`;
        const name = viewName || 'NewView';
        const fullPath = schema ? `${q(schema)}.${q(name)}` : q(name);

        let sql = dbType === 'mssql' ? `USE ${q(selectedDb)};\nGO\n\n` : '';
        sql += `CREATE VIEW ${fullPath}\nAS\n${generateSelectSql()}`;
        return sql;
    };

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-border bg-card/30 flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest leading-none mb-1">View Designer</h2>
                        <div className="flex items-center gap-2">
                            <Database className="w-3 h-3 text-muted-foreground" />
                            <select
                                value={selectedDb}
                                onChange={(e) => setSelectedDb(e.target.value)}
                                className="bg-transparent border-none p-0 text-[10px] text-muted-foreground uppercase font-black tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none"
                            >
                                {databases.map(db => (
                                    <option key={db.name} value={db.name} className="bg-background text-foreground">{db.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onExecute(generateSql())}
                        disabled={!viewName || selectedTables.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> Create View
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Configuration Panel */}
                <div className="w-80 border-r border-border/50 flex flex-col overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent/60">Definition Info</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Schema</label>
                                    <input
                                        type="text"
                                        value={schema}
                                        onChange={(e) => setSchema(e.target.value)}
                                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">View Name</label>
                                    <input
                                        type="text"
                                        value={viewName}
                                        onChange={(e) => setViewName(e.target.value)}
                                        placeholder="v_my_view_name"
                                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/30 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent/60">Source Explorer</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    placeholder="Filter tables..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-muted/20 border border-border/50 rounded-lg pl-9 pr-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                />
                            </div>
                            <div className="space-y-1 max-h-[400px] overflow-auto custom-scrollbar pr-2">
                                {currentMetadata.tables?.filter((t: any) => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t: any) => (
                                    <button
                                        key={t.name}
                                        onClick={() => toggleTable(t)}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                                            selectedTables.includes(t.name) ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <Table className="w-3.5 h-3.5" />
                                        <span className="truncate">{t.name}</span>
                                        {selectedTables.includes(t.name) && <Check className="w-3 h-3 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Designer Workspace */}
                <div className="flex-1 bg-muted/5 flex flex-col">
                    <div className="flex-1 p-8 overflow-auto">
                        {selectedTables.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                                <LayoutDashboard className="w-16 h-16 text-muted-foreground" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Select target tables from the explorer <br /> to start designing yours view</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-6 items-start">
                                {selectedTables.map(tName => (
                                    <div key={tName} className="w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 bg-accent/5 border-b border-border flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate flex-1">{tName}</span>
                                            <button onClick={() => toggleTable({ name: tName })} className="text-muted-foreground hover:text-red-500 p-1">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="p-2 space-y-0.5 max-h-60 overflow-auto">
                                            {tableColumns[tName]?.map(col => (
                                                <button
                                                    key={col.name}
                                                    onClick={() => toggleColumn(tName, col.name)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all text-left group",
                                                        selectedColumns[tName]?.includes(col.name) ? "bg-accent/10 text-accent font-bold" : "text-muted-foreground/60 hover:bg-muted/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-3 h-3 rounded border border-border shrink-0 flex items-center justify-center transition-colors",
                                                        selectedColumns[tName]?.includes(col.name) && "bg-accent border-accent"
                                                    )}>
                                                        {selectedColumns[tName]?.includes(col.name) && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    <span className="truncate">{col.name}</span>
                                                </button>
                                            ))}
                                            {loadingTable === tName && (
                                                <div className="flex items-center justify-center p-4">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SQL Preview */}
                    <div className="h-64 border-t border-border flex bg-[#1e1e1e]">
                        <div className="w-48 border-r border-border/50 p-6 flex flex-col justify-between">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Generated <br /> Create Script</div>
                            <div className="p-3 bg-muted/5 rounded-xl border border-border/20 text-[9px] text-muted-foreground leading-relaxed">
                                This script will define a new persistent view on your database.
                            </div>
                        </div>
                        <div className="flex-1 p-8 font-mono text-sm overflow-auto custom-scrollbar">
                            <pre className="text-emerald-400/90 leading-relaxed font-medium">
                                {generateSql()}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
