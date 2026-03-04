
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

export const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (typeof window === 'undefined') return;

    const history = getHistory();
    const newItem: HistoryItem = {
        ...item,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now()
    };

    const newHistory = [newItem, ...history].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const getHistory = (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const clearHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
};

export const saveBookmark = (name: string, sql: string, category?: string) => {
    if (typeof window === 'undefined') return;

    const bookmarks = getBookmarks();
    const newItem: BookmarkItem = {
        id: Math.random().toString(36).substring(2, 11),
        name,
        sql,
        category,
        timestamp: Date.now()
    };

    const newBookmarks = [newItem, ...bookmarks];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
};

export const getBookmarks = (): BookmarkItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const deleteBookmark = (id: string) => {
    if (typeof window === 'undefined') return;
    const bookmarks = getBookmarks();
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
};
