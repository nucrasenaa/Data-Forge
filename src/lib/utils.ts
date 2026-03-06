import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Helper to get or create a web-based master key for encryption fallback on the web.
 */
async function getWebMasterKey(): Promise<CryptoKey> {
    if (typeof window === 'undefined') throw new Error('Cannot get key outside browser');
    const storageKey = 'df_master_key';
    const existingKey = localStorage.getItem(storageKey);
    let keyData: Uint8Array;

    if (existingKey) {
        keyData = new Uint8Array(atob(existingKey).split('').map(c => c.charCodeAt(0)));
    } else {
        keyData = window.crypto.getRandomValues(new Uint8Array(32));
        localStorage.setItem(storageKey, btoa(String.fromCharCode(...keyData)));
    }

    return await window.crypto.subtle.importKey(
        'raw',
        keyData as any,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encerts a sensitive string using Web Crypto API (AES-GCM).
 */
async function webEncrypt(value: string): Promise<string> {
    const key = await getWebMasterKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        encoded as any
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
}

/**
 * Internal helper: Decrypts a sensitive string using Web Crypto API (AES-GCM).
 * Returns { value: string, decrypted: boolean }
 */
async function webDecrypt(value: string): Promise<{ value: string; decrypted: boolean }> {
    try {
        // Basic check: if it's not base64, it's definitely not our encrypted string
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length < 16) {
            return { value, decrypted: false };
        }

        const key = await getWebMasterKey();
        const combined = new Uint8Array(atob(value).split('').map(c => c.charCodeAt(0)));
        if (combined.length < 13) return { value, decrypted: false }; // IV(12) + at least 1 byte data

        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decryptedData = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv as any },
            key,
            data as any
        );
        return { value: new TextDecoder().decode(decryptedData), decrypted: true };
    } catch (e) {
        return { value, decrypted: false };
    }
}

/**
 * Encrypts a sensitive string (like a password) if running in Electron.
 * Falls back to Web Crypto API for non-Electron environments.
 */
export async function encryptValue(value: string | undefined): Promise<string | undefined> {
    if (!value) return value;
    const isElectron = typeof window !== 'undefined' && (window as any).electron?.crypto;
    if (isElectron) {
        try {
            return await (window as any).electron.crypto.encrypt(value);
        } catch (e) {
            console.error('Electron Encryption failed', e);
            return await webEncrypt(value);
        }
    }
    // Web fallback
    try {
        return await webEncrypt(value);
    } catch (e) {
        return value;
    }
}

/**
 * Decrypts a sensitive string. Returns the decrypted value.
 */
export async function decryptValue(value: string | undefined): Promise<string | undefined> {
    const res = await decryptValueDetailed(value);
    return res.value;
}

/**
 * Decrypts a sensitive string and returns detailed status (for migration).
 */
export async function decryptValueDetailed(value: string | undefined): Promise<{ value: string | undefined; decrypted: boolean }> {
    if (!value) return { value, decrypted: false };
    const isElectron = typeof window !== 'undefined' && (window as any).electron?.crypto;

    if (isElectron) {
        try {
            const dec = await (window as any).electron.crypto.decrypt(value);
            // safeStorage doesn't easily tell us if it JUST failed or if it returned original
            // but if it's different from input, it was definitely encrypted
            return { value: dec, decrypted: dec !== value };
        } catch (e) {
            // Might be web-encrypted or not encrypted
            return await webDecrypt(value);
        }
    }

    // Web fallback
    return await webDecrypt(value);
}
