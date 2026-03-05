'use client';

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    Database,
    Terminal,
    Settings2,
    Play,
    Check,
    FileCode,
    Code2,
    ChevronDown,
    Zap,
    Cpu
} from 'lucide-react';
import QueryEditor from './QueryEditor';
import { cn } from '@/lib/utils';

interface Param {
    name: string;
    type: string;
    direction: 'IN' | 'OUT';
    defaultValue?: string;
}

interface ProcDesignerProps {
    dbType: string;
    database: string;
    databases?: any[];
    onExecute: (sql: string) => void;
    onClose: () => void;
}

const TEMPLATES: Record<string, any> = {
    mssql: {
        'Simple CRUD': (name: string, schema: string, params: Param[]) => {
            const paramList = params.map(p => `  @${p.name} ${p.type.toUpperCase()}${p.direction === 'OUT' ? ' OUTPUT' : ''}${p.defaultValue ? ` = ${p.defaultValue}` : ''}`).join(',\n');
            return `CREATE PROCEDURE ${schema}.${name}\n${paramList ? `${paramList}\n` : ''}AS\nBEGIN\n  SET NOCOUNT ON;\n  \n  -- Add your logic here\n  SELECT 'Hello World';\nEND`;
        },
        'Logging Wrapper': (name: string, schema: string, params: Param[]) => {
            return `CREATE PROCEDURE ${schema}.${name}\nAS\nBEGIN\n  INSERT INTO LogTable (Message, LogDate) VALUES ('Procedure Started', GETDATE());\n  \n  BEGIN TRY\n    -- Your Logic\n  END TRY\n  BEGIN CATCH\n    INSERT INTO LogTable (Message, LogDate) VALUES (ERROR_MESSAGE(), GETDATE());\n  END CATCH\nEND`;
        }
    },
    postgres: {
        'Basic Function': (name: string, schema: string, params: Param[]) => {
            const paramList = params.map(p => `${p.name} ${p.type.toUpperCase()}${p.direction === 'OUT' ? ' OUT' : ''}`).join(', ');
            return `CREATE OR REPLACE FUNCTION ${schema}.${name}(${paramList})\nRETURNS void AS $$\nBEGIN\n  -- Add logic here\nEND;\n$$ LANGUAGE plpgsql;`;
        }
    }
};

export default function ProcDesigner({ dbType, database, databases = [], onExecute, onClose }: ProcDesignerProps) {
    const dialect = dbType || 'mssql';
    const [name, setName] = useState('');
    const [schema, setSchema] = useState(dialect === 'mssql' ? 'dbo' : (dialect === 'postgres' ? 'public' : ''));
    const [params, setParams] = useState<Param[]>([]);
    const [body, setBody] = useState('-- Procedure body goes here');
    const [selectedDb, setSelectedDb] = useState(database);
    const [activeTab, setActiveTab] = useState<'design' | 'logic'>('design');

    const addParam = () => {
        setParams([...params, { name: 'param' + (params.length + 1), type: dialect === 'mssql' ? 'int' : 'integer', direction: 'IN' }]);
    };

    const removeParam = (index: number) => {
        setParams(params.filter((_, i) => i !== index));
    };

    const updateParam = (index: number, updates: Partial<Param>) => {
        const newParams = [...params];
        newParams[index] = { ...newParams[index], ...updates };
        setParams(newParams);
    };

    const generateSql = () => {
        const q = dialect === 'mssql' ? (s: string) => `[${s}]` : (s: string) => `"${s}"`;
        const pPrefix = dialect === 'mssql' ? '@' : '';

        let sql = dialect === 'mssql' ? `USE ${q(selectedDb)};\nGO\n\n` : '';

        if (dialect === 'mssql') {
            const paramStr = params.map(p => `  ${pPrefix}${p.name} ${p.type.toUpperCase()}${p.direction === 'OUT' ? ' OUTPUT' : ''}${p.defaultValue ? ` = ${p.defaultValue}` : ''}`).join(',\n');
            sql += `CREATE PROCEDURE ${q(schema)}.${q(name || 'NewProcedure')}\n${paramStr ? `${paramStr}\n` : ''}AS\nBEGIN\n${body.split('\n').map(line => '  ' + line).join('\n')}\nEND`;
        } else {
            const paramStr = params.map(p => `${p.name} ${p.type.toUpperCase()}${p.direction === 'OUT' ? ' OUT' : ''}`).join(', ');
            sql += `CREATE OR REPLACE FUNCTION ${q(schema)}.${q(name || 'NewFunction')}(${paramStr})\nRETURNS void AS $$\nBEGIN\n${body}\nEND;\n$$ LANGUAGE plpgsql;`;
        }

        return sql;
    };

    const applyTemplate = (templateName: string) => {
        const template = TEMPLATES[dialect]?.[templateName];
        if (template) {
            const fullSql = template(name || 'NewProcedure', schema, params);
            // Extract body if possible, or just set the whole thing
            setBody('-- Generated from template\n' + fullSql);
            setActiveTab('logic');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
            {/* Header */}
            <div className="h-16 border-b border-border bg-card/30 flex items-center px-8 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] leading-none mb-1">Proc & Func Designer</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 cursor-pointer hover:text-orange-400 transition-colors">
                                <Database className="w-3 h-3 text-muted-foreground/60" />
                                <select
                                    value={selectedDb}
                                    onChange={(e) => setSelectedDb(e.target.value)}
                                    className="bg-transparent border-none p-0 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest focus:ring-0 outline-none"
                                >
                                    {databases.map(db => (
                                        <option key={db.name} value={db.name} className="bg-background text-foreground uppercase">{db.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-muted/30 p-1 rounded-xl border border-border flex mr-4">
                        <button
                            onClick={() => setActiveTab('design')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                activeTab === 'design' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Design
                        </button>
                        <button
                            onClick={() => setActiveTab('logic')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                activeTab === 'logic' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Logic Body
                        </button>
                    </div>

                    <button
                        onClick={() => onExecute(generateSql())}
                        className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Save className="w-4 h-4 ml-[-4px]" /> Create Procedure
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'design' ? (
                    <div className="flex-1 flex overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* LEFT: Props */}
                        <div className="w-96 border-r border-border/50 bg-muted/5 p-8 space-y-8 overflow-auto">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/60">Procedure Identification</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground/60 ml-2">Schema</label>
                                        <input
                                            value={schema}
                                            onChange={(e) => setSchema(e.target.value)}
                                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground/60 ml-2">Procedure Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="sp_process_data"
                                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/30 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/60 text-center">Boilerplate Templates</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.keys(TEMPLATES[dialect] || {}).map(tName => (
                                        <button
                                            key={tName}
                                            onClick={() => applyTemplate(tName)}
                                            className="group relative flex items-center gap-4 p-4 bg-card border border-border hover:border-orange-500/50 rounded-2xl transition-all hover:scale-[1.02] text-left overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/20 group-hover:bg-orange-500 transition-colors" />
                                            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest">{tName}</div>
                                                <div className="text-[9px] text-muted-foreground mt-0.5">Generate body with {tName} structure</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Parameters */}
                        <div className="flex-1 p-8 space-y-8 overflow-auto bg-[radial-gradient(circle_at_center,_#1e1e22_1px,_transparent_1px)] bg-[size:32px_32px]">
                            <div className="max-w-4xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted/50 rounded-lg"><Cpu className="w-4 h-4 text-orange-400" /></div>
                                        <h3 className="text-lg font-black uppercase tracking-tighter">Parameter Definitions</h3>
                                    </div>
                                    <button
                                        onClick={addParam}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-orange-500/20 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Add Parameter
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {params.length === 0 ? (
                                        <div className="p-10 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-3 opacity-30">
                                            <Settings2 className="w-10 h-10" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No parameters defined yet</p>
                                        </div>
                                    ) : (
                                        params.map((p, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-card/50 border border-border rounded-2xl group hover:border-orange-500/30 transition-all animate-in slide-in-from-right-4">
                                                <div className="flex-1 grid grid-cols-4 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Name</label>
                                                        <div className="relative">
                                                            {dialect === 'mssql' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/50 font-mono text-xs">@</span>}
                                                            <input
                                                                value={p.name}
                                                                onChange={(e) => updateParam(i, { name: e.target.value })}
                                                                className={cn(
                                                                    "w-full bg-muted/20 border border-border/50 rounded-xl pr-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 transition-all font-mono",
                                                                    dialect === 'mssql' ? "pl-7" : "pl-3"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Data Type</label>
                                                        <input
                                                            value={p.type}
                                                            onChange={(e) => updateParam(i, { type: e.target.value })}
                                                            className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 transition-all font-mono uppercase"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Direction</label>
                                                        <select
                                                            value={p.direction}
                                                            onChange={(e) => updateParam(i, { direction: e.target.value as any })}
                                                            className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 transition-all font-black uppercase tracking-widest outline-none"
                                                        >
                                                            <option value="IN">Input (Normal)</option>
                                                            <option value="OUT">Output (Return)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Default</label>
                                                        <input
                                                            value={p.defaultValue || ''}
                                                            placeholder="NULL"
                                                            onChange={(e) => updateParam(i, { defaultValue: e.target.value })}
                                                            className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeParam(i)}
                                                    className="p-2 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all self-end mb-0.5 opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="h-full relative">
                            <QueryEditor
                                query={body}
                                onQueryChange={(val: string) => setBody(val)}
                                onExecute={() => onExecute(generateSql())}
                                loading={false}
                                dbType={dialect}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Visual Logic Preview (Mini) */}
            <div className="h-12 border-t border-border bg-card/50 flex items-center px-8 justify-between shrink-0 overflow-hidden">
                <div className="flex items-center gap-6 overflow-hidden">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 whitespace-nowrap">Signature Preview:</span>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] font-mono text-orange-400 whitespace-nowrap">{schema}.{name || 'NewProcedure'}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap">
                            ({params.map(p => `${dialect === 'mssql' ? '@' : ''}${p.name}`).join(', ')})
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Syntax Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
