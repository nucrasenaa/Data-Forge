import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft, Database, ScrollText } from 'lucide-react';

export default async function ReleaseNotesPage() {
    const filePath = path.join(process.cwd(), 'RELEASE_NOTES.md');
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Release Notes\n\nNo release notes found.';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <Link href="/documents" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-accent/10 rounded-xl">
                            <Database className="w-5 h-5 text-accent" />
                        </div>
                        <h1 className="font-black tracking-tighter uppercase gradient-text">Data Forge Docs</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span>Version 1.2.0</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">Latest</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span>Three Man Dev</span>
                </div>
            </header>

            <div className="flex-1 flex max-w-7xl w-full mx-auto px-6 py-10 gap-12">
                {/* Sidebar */}
                <aside className="w-64 shrink-0 space-y-8 sticky top-28 h-fit">
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 px-4">Navigation</h2>
                        <nav className="space-y-1">
                            <Link href="/documents" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-all group border border-transparent hover:border-border/50">
                                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                <span className="text-sm font-bold opacity-70 group-hover:opacity-100">Back to Docs</span>
                            </Link>
                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/5 border border-accent/20">
                                <ScrollText className="w-4 h-4 text-accent" />
                                <span className="text-sm font-bold text-accent">Release Notes</span>
                            </div>
                        </nav>
                    </section>

                    {/* Version history quick jump */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 px-4">Versions</h2>
                        <div className="space-y-1 px-2">
                            {[
                                { ver: 'v1.2.0', label: '2026-03-06', badge: 'Latest', color: 'text-accent bg-accent/10 border-accent/20' },
                                { ver: 'v1.1.1', label: '2026-03-05', badge: '', color: 'text-muted-foreground bg-muted/30 border-border/30' },
                                { ver: 'v1.1.0', label: '2026-03-05', badge: '', color: 'text-muted-foreground bg-muted/30 border-border/30' },
                                { ver: 'v1.0.0', label: '2026-03-05', badge: 'Launch', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                            ].map((v) => (
                                <div key={v.ver} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider ${v.color}`}>
                                    <span>{v.ver}</span>
                                    <span className="opacity-60">{v.badge || v.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-12">
                        <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4">
                            Changelog
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase gradient-text leading-tight">
                            Release Notes
                        </h1>
                        <p className="text-xl text-muted-foreground/60 mt-4 leading-relaxed max-w-2xl">
                            Version history and feature changelog for Data Forge.
                        </p>
                    </div>

                    <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-accent prose-code:text-accent prose-pre:bg-card/50 prose-pre:border prose-pre:border-border prose-pre:rounded-2xl prose-img:rounded-2xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </main>
            </div>
        </div>
    );
}
