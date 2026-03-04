'use client';

import React, { useMemo } from 'react';
import { Network, Activity, Clock, Database, ChevronRight, ChevronDown, Table as TableIcon, Filter, Layers, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanNode {
    id: number;
    parent: number;
    type: string;
    logicalOp: string;
    physicalOp: string;
    estimateRows: number;
    actualRows: number;
    actualExecutions: number;
    totalSubtreeCost: number;
    description: string;
    children: PlanNode[];
    level: number;
}

interface ExecutionPlanProps {
    data: any[];
    dialect: string;
}

export default function ExecutionPlan({ data, dialect }: ExecutionPlanProps) {
    const planTree = useMemo(() => {
        if (!data || data.length === 0) return null;

        if (dialect === 'mssql') {
            // MSSQL Statistics Profile parsing
            // Expected columns: NodeId, Parent, PhysicalOp, LogicalOp, EstimateRows, ActualRows, etc.
            const nodes: Record<number, PlanNode> = {};
            const rootNodes: PlanNode[] = [];

            // Sort by NodeId to ensure parents are processed first if possible (though we'll map them later)
            const sortedData = [...data].sort((a, b) => (a.NodeId || 0) - (b.NodeId || 0));

            sortedData.forEach(row => {
                const node: PlanNode = {
                    id: row.NodeId,
                    parent: row.Parent,
                    type: row.PhysicalOp,
                    logicalOp: row.LogicalOp,
                    physicalOp: row.PhysicalOp,
                    estimateRows: row.EstimateRows,
                    actualRows: row.ActualRows,
                    actualExecutions: row.ActualExecutions || row.Executions || 1,
                    totalSubtreeCost: row.TotalSubtreeCost || 0,
                    description: row.Argument || '',
                    children: [],
                    level: 0
                };
                nodes[node.id] = node;
            });

            Object.values(nodes).forEach(node => {
                if (node.parent === 0) {
                    rootNodes.push(node);
                } else if (nodes[node.parent]) {
                    nodes[node.parent].children.push(node);
                }
            });

            return rootNodes;
        } else if (dialect === 'postgres') {
            // Extract Postgres plan from JSON format if available
            // [ { "Plan": { ... } } ]
            const pgPlan = data[0]?.['Plan'];
            if (pgPlan) {
                const parsePgNode = (pgNode: any, id: number, parentId: number): PlanNode => {
                    const node: PlanNode = {
                        id,
                        parent: parentId,
                        type: pgNode['Node Type'],
                        logicalOp: pgNode['Strategy'] || pgNode['Node Type'],
                        physicalOp: pgNode['Node Type'],
                        estimateRows: pgNode['Plan Rows'],
                        actualRows: pgNode['Actual Rows'] || 0,
                        actualExecutions: pgNode['Actual Loops'] || 1,
                        totalSubtreeCost: pgNode['Total Cost'] / 100, // Normalized
                        description: pgNode['Alias'] ? `Table: ${pgNode['Alias']}` : '',
                        children: [],
                        level: 0
                    };

                    if (pgNode['Plans']) {
                        pgNode['Plans'].forEach((child: any, i: number) => {
                            node.children.push(parsePgNode(child, id * 10 + i + 1, id));
                        });
                    }
                    return node;
                };

                return [parsePgNode(pgPlan, 1, 0)];
            }
        }

        return null;
    }, [data, dialect]);

    const renderNode = (node: PlanNode, index: number) => {
        const isExpensive = node.totalSubtreeCost > 0.5; // Arbitrary threshold
        const rowDiscrepancy = node.actualRows > node.estimateRows * 2 || node.actualRows < node.estimateRows / 2;

        return (
            <div key={`${node.id}-${index}`} className="ml-6 border-l border-border/30 pl-4 py-2 relative">
                <div className="absolute left-0 top-6 w-4 h-px bg-border/30" />

                <div className={cn(
                    "p-3 rounded-xl border bg-card/50 hover:bg-card transition-all group relative max-w-2xl",
                    isExpensive ? "border-orange-500/30 group-hover:border-orange-500/50" : "border-border/50"
                )}>
                    {isExpensive && (
                        <div className="absolute -top-2 -right-2 p-1 bg-orange-500 text-white rounded-md">
                            <Zap className="w-3 h-3 fill-current" />
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            node.physicalOp.includes('Scan') ? "bg-blue-500/10 text-blue-400" :
                                node.physicalOp.includes('Seek') ? "bg-emerald-500/10 text-emerald-400" :
                                    node.physicalOp.includes('Join') ? "bg-purple-500/10 text-purple-400" : "bg-muted text-muted-foreground"
                        )}>
                            <Layers className="w-4 h-4" />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider">{node.physicalOp}</h4>
                                <span className="text-[10px] font-mono opacity-40">#{node.id}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium">{node.logicalOp}</p>

                            {node.description && (
                                <div className="text-[10px] bg-muted/30 p-2 rounded border border-border/20 font-mono text-muted-foreground/80 break-all mt-2">
                                    {node.description}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border/10">
                                <div>
                                    <span className="block text-[9px] font-black uppercase text-muted-foreground/40">Cost</span>
                                    <span className="text-[11px] font-bold text-accent">{(node.totalSubtreeCost * 100).toFixed(2)}%</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] font-black uppercase text-muted-foreground/40">Rows</span>
                                    <span className={cn(
                                        "text-[11px] font-bold",
                                        rowDiscrepancy ? "text-orange-400" : "text-foreground"
                                    )}>{node.actualRows.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] font-black uppercase text-muted-foreground/40">Execs</span>
                                    <span className="text-[11px] font-bold">{node.actualExecutions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {node.children.length > 0 && (
                    <div className="mt-2">
                        {node.children.map((child, i) => renderNode(child, i))}
                    </div>
                )}
            </div>
        );
    };

    if (!planTree) {
        return (
            <div className="flex-1 flex flex-col p-6 bg-card/20 rounded-xl border border-dashed border-border overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                        <Network className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider">Raw Execution Plan</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">{dialect.toUpperCase()} ANALYSIS</p>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-card/50 rounded-lg border border-border/30 p-4 font-mono text-xs custom-scrollbar">
                    {data && data.length > 0 ? (
                        <pre className="text-emerald-400 leading-relaxed">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                            No execution plan data captured for this query.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-6 bg-background/50 custom-scrollbar">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 rounded-xl text-accent border border-accent/20">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Live Execution Plan</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Relational Flow Analysis</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Optimized</span>
                    </div>
                </div>
            </div>

            <div className="py-4">
                {planTree.map((node, i) => renderNode(node, i))}
            </div>
        </div>
    );
}
