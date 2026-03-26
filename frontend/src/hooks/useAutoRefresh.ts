import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
const BASE_URL = API_URL.replace(/\/$/, '');

// Refresh token 5 minutes before expiry (access token expires in 30 min)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;
const DEFAULT_ACCESS_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

/**
 * Decode JWT token to get expiry time
 */
function getTokenExpiry(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Get remaining time until token expiry
 */
function getTimeUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token);
  if (!expiry) return DEFAULT_ACCESS_TOKEN_EXPIRY_MS;
  return expiry - Date.now();
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken(): Promise<{ access_token: string; refresh_token: string } | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return { access_token, refresh_token };
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
}

/**
 * Hook to automatically refresh access token before expiry
 * 
 * @param enabled - Whether to enable auto-refresh (default: true)
 * @param onRefreshSuccess - Callback when token is refreshed successfully
 * @param onRefreshFailure - Callback when token refresh fails (e.g., logout user)
 */
export function useAutoRefresh({
  enabled = true,
  onRefreshSuccess,
  onRefreshFailure,
}: {
  enabled?: boolean;
  onRefreshSuccess?: (tokens: { access_token: string; refresh_token: string }) => void;
  onRefreshFailure?: () => void;
} = {}) {
  const refreshTimeoutRef = useRef<number | null>(null);

  const scheduleRefresh = useCallback(() => {
    if (!enabled) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    const timeUntilExpiry = getTimeUntilExpiry(accessToken);
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_THRESHOLD_MS);

    console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000)}s, scheduling refresh in ${Math.round(refreshTime / 1000)}s`);

    refreshTimeoutRef.current = window.setTimeout(async () => {
      const result = await refreshAccessToken();
      if (result) {
        onRefreshSuccess?.(result);
        // Schedule next refresh
        scheduleRefresh();
      } else {
        onRefreshFailure?.();
      }
    }, refreshTime);
  }, [enabled, onRefreshSuccess, onRefreshFailure]);

  const cancelRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Clear any pending refreshes
  useEffect(() => {
    return () => cancelRefresh();
  }, [cancelRefresh]);

  // Schedule refresh on mount and when tokens change
  useEffect(() => {
    if (enabled) {
      scheduleRefresh();
    }
    return () => cancelRefresh();
  }, [enabled, scheduleRefresh, cancelRefresh]);

  // Manual refresh function
  const refreshNow = useCallback(async () => {
    cancelRefresh();
    const result = await refreshAccessToken();
    if (result) {
      onRefreshSuccess?.(result);
      scheduleRefresh();
      return result;
    } else {
      onRefreshFailure?.();
      return null;
    }
  }, [cancelRefresh, onRefreshSuccess, onRefreshFailure, scheduleRefresh]);

  return { refreshNow, cancelRefresh };
}
