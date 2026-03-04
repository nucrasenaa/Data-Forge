'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ConnectionForm from '@/components/ConnectionForm';
import Sidebar from '@/components/Sidebar';
import QueryEditor from '@/components/QueryEditor';
import DataTable from '@/components/DataTable';
import { Database, LogOut, Table as TableIcon, LayoutDashboard, Terminal, Search, Filter, X, Plus, Server, Trash2, Globe, User, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionHistory {
  id: string;
  name?: string;
  dbType?: string;
  connectionString?: string;
  server: string;
  port: number;
  user: string;
  database: string;
  lastUsed: number;
}

export default function Home() {
  const [config, setConfig] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [initialFormConfig, setInitialFormConfig] = useState<any>(null);
  const [history, setHistory] = useState<ConnectionHistory[]>([]);

  const [selectedTable, setSelectedTable] = useState<{ name: string, database: string, type: string } | null>(null);
  const [queryResult, setQueryResult] = useState<{ data: any[], columns: string[], totalRows: number }>({ data: [], columns: [], totalRows: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'query'>('query');
  const [metadata, setMetadata] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT TOP 100 * FROM ');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');
  const [filter, setFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('db_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  const handleConnect = (newConfig: any) => {
    setConfig(newConfig);

    // Manage history
    const connectionId = newConfig.connectionString
      ? `url-${newConfig.connectionString}`
      : `${newConfig.server}:${newConfig.port}-${newConfig.user}-${newConfig.database}`;

    const newHistoryItem: ConnectionHistory = {
      id: connectionId,
      name: newConfig.name,
      dbType: newConfig.dbType,
      connectionString: newConfig.connectionString,
      server: newConfig.server || '',
      port: newConfig.port || 1433,
      user: newConfig.user || '',
      database: newConfig.database || '',
      lastUsed: Date.now()
    };

    const updatedHistory = [
      newHistoryItem,
      ...history.filter(item => item.id !== connectionId)
    ].slice(0, 12); // Keep last 12

    setHistory(updatedHistory);
    localStorage.setItem('db_history', JSON.stringify(updatedHistory));
    setShowForm(false);
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('db_history', JSON.stringify(updatedHistory));
  };

  const handleDisconnect = () => {
    setConfig(null);
    setQueryResult({ data: [], columns: [], totalRows: 0 });
    setSelectedTable(null);
    setMetadata(null);
  };

  const executeQuery = useCallback(async (query: string, options: {
    db?: string,
    p?: number,
    pSize?: number,
    sortCol?: string,
    sortD?: 'ASC' | 'DESC',
    includeCount?: boolean,
    silent?: boolean
  } = {}) => {
    if (!options.silent) setLoading(true);
    const targetDb = options.db || (selectedTable?.database) || config.database;
    const currentPageSize = options.pSize || pageSize;

    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { ...config, database: targetDb },
          query,
          page: options.p || page,
          pageSize: currentPageSize,
          orderBy: options.sortCol || sortColumn,
          orderDir: options.sortD || sortDir,
          includeCount: options.includeCount ?? false
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQueryResult(prev => ({
          data: data.data,
          columns: data.columns,
          totalRows: options.includeCount ? data.totalRows : prev.totalRows
        }));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      if (!options.silent) alert('Failed to execute query');
    } finally {
      if (!options.silent) setLoading(false);
    }
  }, [config, selectedTable, page, pageSize, sortColumn, sortDir]);

  const handleObjectSelect = (fullName: string, type: 'table' | 'view' | 'procedure' | 'synonym', databaseName?: string) => {
    const db = databaseName || config.database;
    setSelectedTable({ name: fullName, database: db, type });
    setActiveTab('data');
    setPage(1);
    setSortColumn(undefined);
    setSortDir('ASC');
    setFilter('');

    let query = '';
    if (type === 'procedure') {
      query = `SELECT definition \nFROM [${db}].sys.sql_modules \nWHERE object_id = OBJECT_ID('[${db}].${fullName}')`;
    } else {
      query = `SELECT TOP 100 * FROM [${db}].${fullName}`;
    }

    setSqlQuery(query);
    executeQuery(query, { db, p: 1, sortCol: undefined, includeCount: true });
  };

  const reloadData = () => {
    if (selectedTable) {
      const condition = filter.trim() ? ` WHERE ${filter}` : '';
      const query = `SELECT * FROM [${selectedTable.database}].${selectedTable.name}${condition}`;
      executeQuery(query);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (selectedTable) {
      const condition = filter.trim() ? ` WHERE ${filter}` : '';
      const query = `SELECT * FROM [${selectedTable.database}].${selectedTable.name}${condition}`;
      executeQuery(query, { p: newPage });
    }
  };

  const handleSort = (column: string) => {
    const newDir = sortColumn === column && sortDir === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(column);
    setSortDir(newDir);
    if (selectedTable) {
      const condition = filter.trim() ? ` WHERE ${filter}` : '';
      const query = `SELECT * FROM [${selectedTable.database}].${selectedTable.name}${condition}`;
      executeQuery(query, { sortCol: column, sortD: newDir });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    if (selectedTable) {
      const condition = filter.trim() ? ` WHERE ${filter}` : '';
      const query = `SELECT * FROM [${selectedTable.database}].${selectedTable.name}${condition}`;
      executeQuery(query, { p: 1, pSize: newSize, includeCount: true });
    }
  };

  const handleFilterSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTable) {
      const condition = filter.trim() ? ` WHERE ${filter}` : '';
      const query = `SELECT * FROM [${selectedTable.database}].${selectedTable.name}${condition}`;
      executeQuery(query, { p: 1, includeCount: true });
    }
  };

  const handleUpdate = async (rowIndex: number, column: string, newValue: any, originalRow: any) => {
    if (!selectedTable) return false;

    try {
      const res = await fetch('/api/db/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          database: selectedTable.database,
          table: selectedTable.name,
          updates: { [column]: newValue },
          where: originalRow
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.rowsAffected === 0) {
          alert('No rows were updated.');
          return false;
        }
        reloadData();
        return true;
      } else {
        alert(data.message);
        return false;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Update failed');
      return false;
    }
  };

  const handleMetadataLoad = (dbName: string, newMetadata: any) => {
    if (dbName.toLowerCase() === (selectedTable?.database.toLowerCase() || config.database.toLowerCase())) {
      setMetadata(newMetadata);
    }
  };

  if (!config) {
    if (showForm) {
      return (
        <ConnectionForm
          onConnect={handleConnect}
          onCancel={() => setShowForm(false)}
          initialConfig={initialFormConfig}
        />
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 mb-2">
              <Database className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter gradient-text uppercase">Database Explorer</h1>
            <p className="text-muted-foreground text-lg">Select a recent connection or create a new one</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Card */}
            <button
              onClick={() => { setInitialFormConfig(null); setShowForm(true); }}
              className="h-48 rounded-2xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all group flex flex-col items-center justify-center gap-4"
            >
              <div className="p-4 bg-muted rounded-full group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest opacity-50 group-hover:opacity-100">Add Connection</span>
            </button>

            {/* History Items */}
            {history.map((conn) => (
              <div
                key={conn.id}
                onClick={() => { setInitialFormConfig(conn); setShowForm(true); }}
                className="h-48 rounded-2xl border border-border bg-card/50 p-6 flex flex-col justify-between hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-all" />

                <div className="flex justify-between items-start">
                  <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                    <Server className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 items-center">
                    {conn.connectionString && (
                      <div className="p-1.5 bg-accent/10 text-accent rounded-full" title="URL Mode">
                        <Link className="w-3 h-3" />
                      </div>
                    )}
                    <button
                      onClick={(e) => removeFromHistory(conn.id, e)}
                      className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg truncate group-hover:text-accent transition-colors flex items-center gap-2">
                    {conn.name || (conn.connectionString ? 'DB URL' : conn.server)}
                    {!conn.name && !conn.connectionString && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground/50 font-normal">Host</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Globe className="w-3 h-3" />
                    {conn.database || 'Metadata URL'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-mono">
                    <User className="w-3 h-3" />
                    {conn.dbType?.toUpperCase() || 'MSSQL'} • {conn.user || 'Link'}
                  </div>
                </div>

                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold mt-2">
                  {new Date(conn.lastUsed).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/40 font-mono uppercase tracking-[0.2em]">
            MSSQL • SECURE • PERSISTENT
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        config={config}
        onObjectSelect={handleObjectSelect}
        onMetadataLoad={handleMetadataLoad}
        selectedObject={selectedTable ? `${selectedTable.database}.${selectedTable.name}` : null}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/10 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Database className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">{config.database}</h1>
              <p className="text-[10px] text-muted-foreground font-mono">{config.server}:{config.port}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('query')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeTab === 'query' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Terminal className="w-3 h-3" />
                Query
              </button>
              <button
                onClick={() => setActiveTab('data')}
                disabled={!selectedTable}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeTab === 'data' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  !selectedTable && "opacity-50 cursor-not-allowed"
                )}
              >
                <TableIcon className="w-3 h-3" />
                View Data
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            <button
              onClick={handleDisconnect}
              className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-muted-foreground"
              title="Disconnect"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden text-foreground">
          {activeTab === 'query' && (
            <div className="h-2/5 shrink-0">
              <QueryEditor
                onExecute={(q) => executeQuery(q, { includeCount: true })}
                loading={loading}
                metadata={metadata}
                value={sqlQuery}
                onChange={setSqlQuery}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate max-w-[400px]">
                  {selectedTable ? `${selectedTable.database}.${selectedTable.name}` : 'Query Results'}
                </h3>
                {activeTab === 'data' && selectedTable && (
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={cn(
                      "ml-4 p-1 rounded hover:bg-muted transition-colors",
                      showFilter || filter ? "text-accent" : "text-muted-foreground"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono bg-accent/10 border border-accent/20 px-2 py-1 rounded text-accent">
                  Total: {queryResult.totalRows.toLocaleString()} rows
                </span>
                <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                  Batch: {queryResult.data.length} rows
                </span>
              </div>
            </div>

            {showFilter && activeTab === 'data' && (
              <form onSubmit={handleFilterSearch} className="mb-4 flex gap-2 animate-in slide-in-from-top-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="WHERE condition (e.g. Id > 100 AND Name LIKE 'A%')"
                    className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {filter && (
                    <button
                      type="button"
                      onClick={() => { setFilter(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                    </button>
                  )}
                </div>
                <button type="submit" className="px-4 py-2 bg-accent text-accent-foreground text-xs font-bold rounded-lg shadow-lg shadow-accent/20">
                  Apply Filter
                </button>
              </form>
            )}

            <DataTable
              data={queryResult.data}
              columns={queryResult.columns}
              loading={loading}
              page={page}
              pageSize={pageSize}
              totalRows={queryResult.totalRows}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSort={handleSort}
              onUpdate={handleUpdate}
              sortColumn={sortColumn}
              sortDir={sortDir}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
