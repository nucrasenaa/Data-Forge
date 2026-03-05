import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export default async function DocPage() {
    const filePath = path.join(process.cwd(), 'Documents', 'INDEX.md');
    const content = fs.readFileSync(filePath, 'utf8');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4">
                    Documentation Hub
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase gradient-text leading-tight">
                    Knowledge Base
                </h1>
                <p className="text-xl text-muted-foreground/60 mt-4 leading-relaxed max-w-2xl">
                    Everything you need to know about Data Forge. From basic setup to advanced database engineering.
                </p>
            </div>

            <div className="prose-theme-custom">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ node, ...props }) => {
                            // Rewrite links like ./USER_GUIDE.md to /documents/USER_GUIDE
                            let href = props.href || '';
                            if (href.endsWith('.md')) {
                                const slug = href.replace('./', '').replace('.md', '');
                                if (slug === 'INDEX') {
                                    href = '/documents';
                                } else if (slug.startsWith('../')) {
                                    // Handle parent links if needed, e.g. ../RELEASE_NOTES.md
                                    href = '/' + slug.replace('../', '').replace('.md', '');
                                } else {
                                    href = `/documents/${slug}`;
                                }
                                return <Link href={href} {...props}>{props.children}</Link>;
                            }
                            return <a {...props}>{props.children}</a>;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
