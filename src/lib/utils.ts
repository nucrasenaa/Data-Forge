import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Encrypts a sensitive string (like a password) if running in Electron.
 */
export async function encryptValue(value: string | undefined): Promise<string | undefined> {
    if (!value) return value;
    const isElectron = typeof window !== 'undefined' && (window as any).electron?.crypto;
    if (isElectron) {
        try {
            return await (window as any).electron.crypto.encrypt(value);
        } catch (e) {
            console.error('Encryption failed', e);
            return value;
        }
    }
    // No-op for web (could add crypto-js here later if needed)
    return value;
}

/**
 * Decrypts a sensitive string if running in Electron.
 */
export async function decryptValue(value: string | undefined): Promise<string | undefined> {
    if (!value) return value;
    const isElectron = typeof window !== 'undefined' && (window as any).electron?.crypto;
    if (isElectron) {
        try {
            // If it's a base64-like string, it's likely encrypted
            // Electron safeStorage output is usually binary -> base64
            return await (window as any).electron.crypto.decrypt(value);
        } catch (e) {
            console.error('Decryption failed', e);
            return value;
        }
    }
    return value;
}
