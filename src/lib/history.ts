import { encryptValue, decryptValueDetailed } from './utils';

export interface HistoryItem {
    id: string;
    sql: string;
    timestamp: number;
    database: string;
    success: boolean;
    executionTime?: number;
    rowsAffected?: number;
}

export interface BookmarkItem {
    id: string;
    name: string;
    sql: string;
    category?: string;
    timestamp: number;
}

const HISTORY_KEY = 'df_query_history';
const BOOKMARKS_KEY = 'df_query_bookmarks';

export const saveToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (typeof window === 'undefined') return;

    const history = await getHistory();
    const encryptedSql = await encryptValue(item.sql) || item.sql;

    const newItem: HistoryItem = {
        ...item,
        sql: encryptedSql,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now()
    };

    const newHistory = [newItem, ...history].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const getHistory = async (): Promise<HistoryItem[]> => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    try {
        const history: HistoryItem[] = JSON.parse(stored);
        let needsMigration = false;

        // Decrypt SQL for each item
        const decrypted = await Promise.all(history.map(async (item) => {
            const { value, decrypted } = await decryptValueDetailed(item.sql);
            if (!decrypted && item.sql && item.sql.trim().length > 0) {
                // If it wasn't encrypted but has content, it's old data
                needsMigration = true;
            }
            return {
                ...item,
                sql: value || ''
            };
        }));

        if (needsMigration) {
            // Re-save entire history with encryption
            const encryptedHistory = await Promise.all(decrypted.map(async (item) => ({
                ...item,
                sql: await encryptValue(item.sql) || item.sql
            })));
            localStorage.setItem(HISTORY_KEY, JSON.stringify(encryptedHistory));
        }

        return decrypted;
    } catch (e) {
        console.error("Failed to load history", e);
        return [];
    }
};

export const clearHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
};

export const saveBookmark = async (name: string, sql: string, category?: string) => {
    if (typeof window === 'undefined') return;

    const bookmarks = await getBookmarks();
    const encryptedSql = await encryptValue(sql) || sql;

    const newItem: BookmarkItem = {
        id: Math.random().toString(36).substring(2, 11),
        name,
        sql: encryptedSql,
        category,
        timestamp: Date.now()
    };

    const newBookmarks = [newItem, ...bookmarks];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
};

export const getBookmarks = async (): Promise<BookmarkItem[]> => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (!stored) return [];

    try {
        const bookmarks: BookmarkItem[] = JSON.parse(stored);
        let needsMigration = false;

        const decrypted = await Promise.all(bookmarks.map(async (item) => {
            const { value, decrypted } = await decryptValueDetailed(item.sql);
            if (!decrypted && item.sql && item.sql.trim().length > 0) {
                needsMigration = true;
            }
            return {
                ...item,
                sql: value || ''
            };
        }));

        if (needsMigration) {
            const encryptedBookmarks = await Promise.all(decrypted.map(async (item) => ({
                ...item,
                sql: await encryptValue(item.sql) || item.sql
            })));
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(encryptedBookmarks));
        }

        return decrypted;
    } catch (e) {
        console.error("Failed to load bookmarks", e);
        return [];
    }
};

export const deleteBookmark = async (id: string) => {
    if (typeof window === 'undefined') return;
    const bookmarks = await getBookmarks();
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
};
