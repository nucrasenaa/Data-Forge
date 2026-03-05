import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';

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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
