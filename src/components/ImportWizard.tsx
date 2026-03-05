'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, FileJson, ArrowRight, Check, AlertCircle, Database, ChevronRight, Play, Settings2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

interface ImportWizardProps {
    config: any;
    metadata: any;
    databases?: any[];
    onClose: () => void;
    onExecute: (sql: string) => void;
}

export default function ImportWizard({ config, metadata, databases = [], onClose, onExecute }: ImportWizardProps) {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [fileData, setFileData] = useState<any[]>([]);
    const [fileColumns, setFileColumns] = useState<string[]>([]);
    const [selectedDb, setSelectedDb] = useState(config.database);
    const [targetTable, setTargetTable] = useState('');
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [tableColumns, setTableColumns] = useState<string[]>([]);
    const [localTables, setLocalTables] = useState<any[]>(metadata.tables || []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (selectedFile.name.endsWith('.json')) {
                try {
                    const data = JSON.parse(text);
                    const rows = Array.isArray(data) ? data : [data];
                    setFileData(rows);
                    if (rows.length > 0) setFileColumns(Object.keys(rows[0]));
                } catch (err) {
                    alert('Invalid JSON file');
                }
            } else if (selectedFile.name.endsWith('.csv')) {
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                setFileColumns(headers);
                const rows = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        obj[h] = values[i]?.trim();
                    });
                    return obj;
                }).filter(r => Object.values(r).some(v => v));
                setFileData(rows);
            }
        };
        reader.readAsText(selectedFile);
    };

    useEffect(() => {
        const fetchTables = async () => {
            if (selectedDb === config.database) {
                setLocalTables(metadata.tables || []);
                return;
            }

            setLoading(true);
            try {
                const data = await apiRequest('/api/db/metadata', 'POST', { ...config, database: selectedDb });
                if (data.success) {
                    setLocalTables(data.metadata.tables || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
    }, [selectedDb, config, metadata.tables]);

    useEffect(() => {
        const fetchColumns = async () => {
            if (!targetTable) return;

            setLoading(true);
            try {
                // Find schema if available in metadata
                const tableInfo = localTables?.find((t: any) => t.name === targetTable || t.fullName === targetTable);
                const schema = tableInfo?.schema;

                const data = await apiRequest('/api/db/columns', 'POST', {
                    ...config,
                    database: selectedDb,
                    table: targetTable,
                    schema: schema
                });

                if (data.success) {
                    setTableColumns(data.columns);
                } else {
                    console.error('Failed to fetch columns:', data.message);
                }
            } catch (err) {
                console.error('Error fetching columns:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchColumns();
    }, [targetTable, config, selectedDb, localTables]);

    const handleNext = () => {
        if (step === 1 && file) setStep(2);
        else if (step === 2 && targetTable) {
            // Auto mapping
            const newMapping: Record<string, string> = {};
            tableColumns.forEach(tc => {
                const match = fileColumns.find(fc => fc.toLowerCase() === tc.toLowerCase());
                if (match) newMapping[tc] = match;
            });
            setMapping(newMapping);
            setStep(3);
        }
    };

    const generateInsertSql = () => {
        if (!targetTable || fileData.length === 0) return '';

        const qStart = config.dbType === 'mssql' ? '[' : (config.dbType === 'postgres' ? '"' : '`');
        const qEnd = config.dbType === 'mssql' ? ']' : (config.dbType === 'postgres' ? '"' : '`');

        const tableInfo = localTables?.find((t: any) => t.name === targetTable || t.fullName === targetTable);
        const schema = tableInfo?.schema || (config.dbType === 'mssql' ? 'dbo' : 'public');
        const tableIdentifier = `${qStart}${schema}${qEnd}.${qStart}${targetTable}${qEnd}`;

        let sql = config.dbType === 'mssql' ? `USE ${qStart}${selectedDb}${qEnd};\nGO\n\n` : '';

        const colsToInsert = Object.keys(mapping);
        const rows = fileData.slice(0, 100); // Limit preview

        rows.forEach(row => {
            const values = colsToInsert.map(tc => {
                const val = row[mapping[tc]];
                if (val === undefined || val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                return val;
            });
            sql += `INSERT INTO ${tableIdentifier} (${colsToInsert.map(c => `${qStart}${c}${qEnd}`).join(', ')}) VALUES (${values.join(', ')});\n`;
        });

        if (fileData.length > 100) {
            sql += `\n-- ... and ${fileData.length - 100} more rows`;
        }

        return sql;
    };

    const handleRunImport = () => {
        const sql = generateInsertSql();
        onExecute(sql);
        onClose();
    };

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
            {/* Header */}
            <div className="h-16 border-b border-border bg-card/30 flex items-center px-8 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-accent/10 rounded-xl text-accent border border-accent/20">
                        <Upload className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] leading-none mb-1">Import Wizard</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] text-muted-foreground uppercase opacity-40 font-bold">Step {step} of 4</span>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="flex items-center gap-1.5">
                                <Database className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">{selectedDb}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Choose your source file</h3>
                            <p className="text-muted-foreground text-sm">Supported formats: CSV, JSON</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <label className={cn(
                                "relative flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all group",
                                file ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-accent/50 hover:bg-accent/5"
                            )}>
                                <input type="file" className="hidden" accept=".csv,.json" onChange={handleFileChange} />
                                <div className="p-4 bg-muted/50 rounded-2xl group-hover:scale-110 transition-transform">
                                    {file ? <Check className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                                </div>
                                <div className="text-center">
                                    <p className="font-bold">{file ? file.name : 'Select a file'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{file ? `${(file.size / 1024).toFixed(2)} KB` : 'or drag and drop here'}</p>
                                </div>
                            </label>

                            <div className="space-y-4">
                                <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg"><AlertCircle className="w-4 h-4 text-blue-500" /></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Pre-import check</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Rows detected:</span>
                                            <span className="font-mono">{fileData.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Columns found:</span>
                                            <span className="font-mono">{fileColumns.length}</span>
                                        </div>
                                    </div>
                                    {file && (
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-3 bg-accent hover:bg-accent/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            Next Step <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Select Target Table</h3>
                            <p className="text-muted-foreground text-sm">Where should we import the data?</p>
                        </div>

                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Target Database</label>
                                <div className="relative">
                                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <select
                                        className="w-full bg-muted/30 border border-border rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none font-bold"
                                        value={selectedDb}
                                        onChange={(e) => { setSelectedDb(e.target.value); setTargetTable(''); }}
                                    >
                                        {databases.map(db => (
                                            <option key={db.name} value={db.name}>{db.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Target Table</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                        <div className="w-3 h-3 border-2 border-muted-foreground rounded-sm" />
                                    </div>
                                    <select
                                        className="w-full bg-muted/30 border border-border rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none font-bold disabled:opacity-50"
                                        value={targetTable}
                                        onChange={(e) => setTargetTable(e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="">Select a table...</option>
                                        {localTables?.map((t: any) => (
                                            <option key={t.fullName || t.name} value={t.fullName || t.name}>{t.fullName || t.name}</option>
                                        ))}
                                    </select>
                                    {loading && <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-spin" />}
                                </div>
                            </div>

                            {targetTable && (
                                <button
                                    onClick={handleNext}
                                    className="w-full py-4 bg-accent hover:bg-accent/90 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    Continue to Mapping <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Map Columns</h3>
                                <p className="text-muted-foreground text-sm">Target: <span className="text-foreground font-bold">{targetTable}</span></p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(2)} className="px-4 py-2 hover:bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all">Back</button>
                                <button
                                    onClick={handleRunImport}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" /> Start Import
                                </button>
                            </div>
                        </div>

                        <div className="bg-card/30 border border-border rounded-3xl overflow-hidden glass">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border text-left">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Table Column</th>
                                        <th className="px-6 py-4 w-12 text-center text-muted-foreground"><ArrowRight className="w-4 h-4" /></th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source File Column</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableColumns.map(tc => (
                                        <tr key={tc} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-accent" />
                                                    <span className="font-mono text-sm font-bold">{tc}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-muted-foreground/30"><ChevronRight className="w-4 h-4" /></td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono"
                                                    value={mapping[tc] || ''}
                                                    onChange={(e) => setMapping({ ...mapping, [tc]: e.target.value })}
                                                >
                                                    <option value="">[ Skip Column ]</option>
                                                    {fileColumns.map(fc => (
                                                        <option key={fc} value={fc}>{fc}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-[#1e1e1e] border border-border rounded-3xl overflow-hidden font-mono text-xs text-emerald-400/80 shadow-2xl relative">
                            <div className="absolute top-4 right-6 text-[9px] font-black uppercase tracking-[0.2em] text-accent/40 bg-accent/5 px-2 py-1 rounded border border-accent/10">SQL Preview (Limited to 500 rows)</div>
                            <pre className="whitespace-pre-wrap leading-relaxed">
                                {generateInsertSql()}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
