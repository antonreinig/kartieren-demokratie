/**
 * Guest Token Management Utility
 * 
 * Handles creation, storage, and retrieval of anonymous user tokens.
 * Used for chat session persistence when users are not logged in.
 */

const GUEST_TOKEN_KEY = 'guestToken';

/**
 * Get or create a guest token for anonymous users.
 * Stores the token in localStorage for persistence across sessions.
 * 
 * @returns The guest token string
 */
export function getOrCreateGuestToken(): string {
    if (typeof window === 'undefined') {
        throw new Error('getOrCreateGuestToken can only be called on the client side');
    }

    let token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
    return token;
}

/**
 * Get the current guest token without creating a new one.
 * 
 * @returns The guest token or null if not set
 */
export function getGuestToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem(GUEST_TOKEN_KEY);
}

/**
 * Delete the guest token and optionally create a new one.
 * Used when users want to "delete their account" and start fresh.
 * 
 * @param createNew If true, immediately creates a new token
 * @returns The new token if createNew is true, otherwise null
 */
export function resetGuestToken(createNew: boolean = false): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    localStorage.removeItem(GUEST_TOKEN_KEY);

    if (createNew) {
        return getOrCreateGuestToken();
    }
    return null;
}
