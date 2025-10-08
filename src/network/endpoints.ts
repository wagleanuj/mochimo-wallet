// src/network/endpoints.ts

import { useCallback, useEffect, useState } from 'react';
import { useStorage } from '../redux/hooks';
import type { Storage } from '../types';
import { StorageProvider } from '../redux/context/StorageContext';

/**
 * Mochimo Wallet API endpoints management.
 * Provides functions to get, set, and validate the active API endpoint.
 */

export interface ApiEndpoint {
    label: string;
    url: string;
}

const ENDPOINTS: ApiEndpoint[] = [
    { label: 'api.mochimo.org', url: 'https://api.mochimo.org' },
    { label: "Nick's Dev API", url: 'https://dev-api.mochiscan.org:8443' },
    { label: 'backup - US Central', url: 'https://api-usc.mochimo.org' },
    { label: 'backup - Singapore', url: 'https://api-sgp.mochimo.org' },
    { label: 'backup - Germany', url: 'https://api-deu.mochimo.org' },
    { label: 'backup - Australia', url: 'http://api-aus.mochimo.org:8080' },
    { label: 'Custom API', url: 'custom' }
];


const STORAGE_KEY = 'api-endpoint';

// Helper to get the storage instance from StorageProvider (platform abstraction)
function getStorage(): Storage {
    return StorageProvider.getStorage();
}

/**
 * Returns the list of available API endpoints.
 */
export function getApiEndpoints(): ApiEndpoint[] {
    return ENDPOINTS;
}

/**
 * Returns the currently selected API endpoint (from StorageProvider or default).
 * If no endpoint is saved, returns the first endpoint in the list.
 */
export async function getCurrentApiEndpoint(): Promise<string> {
    try {
        const storage = getStorage();
        const saved = await storage.getItem(STORAGE_KEY);
        if (saved) return saved;
    } catch (e) {}
    return ENDPOINTS[0].url;
}

/**
 * Sets the active API endpoint and saves it to StorageProvider.
 * Returns true if the URL is valid and was saved, false otherwise.
 */
export async function setApiEndpoint(endpoint: string): Promise<boolean> {
    if (!validateApiEndpoint(endpoint)) return false;
    try {
        const storage = getStorage();
        await storage.setItem(STORAGE_KEY, endpoint);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Validates that the endpoint is a valid URL (http or https) or the string 'custom'.
 */
export function validateApiEndpoint(endpoint: string): boolean {
    if (endpoint === 'custom') return true;
    try {
        // Allow both http and https
        const url = new URL(endpoint);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}


export function useApiEndpoint() {
    const [endpoint, setEndpointState] = useState<string>(ENDPOINTS[0].url);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load endpoint on mount
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const ep = await getCurrentApiEndpoint();
                if (!cancelled) setEndpointState(ep);
                setLoading(false);
            } catch (err) {
                setError('Failed to load endpoint');
                setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Setter that updates both state and storage
    const setEndpoint = useCallback(async (ep: string) => {
        if (!validateApiEndpoint(ep)) {
            setError('Invalid endpoint URL');
            return false;
        }
        setLoading(true);
        const ok = await setApiEndpoint(ep);
        if (ok) {
            setEndpointState(ep);
            setError(null);
        } else {
            setError('Failed to save endpoint');
        }
        setLoading(false);
        return ok;
    }, []);

    return [endpoint, setEndpoint, loading, error] as const;
}
