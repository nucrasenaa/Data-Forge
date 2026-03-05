import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const documentsDir = path.join(process.cwd(), 'Documents');
    if (!fs.existsSync(documentsDir)) {
        return [];
    }
    const files = fs.readdirSync(documentsDir);
    return files
        .filter(file => file.endsWith('.md'))
        .map(file => ({
            slug: file.replace('.md', ''),
        }));
}

export default async function SlugDocPage({ params }: PageProps) {
    const { slug } = await params;
    const fileName = `${slug}.md`;
    const filePath = path.join(process.cwd(), 'Documents', fileName);

    if (!fs.existsSync(filePath)) {
        return notFound();
    }

    const content = fs.readFileSync(filePath, 'utf8');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
