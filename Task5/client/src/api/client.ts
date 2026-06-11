let accessToken: string | null = null;
let refreshToken: string | null = localStorage.getItem('refreshToken');
let onUnauthorized: (() => void) | null = null;

export const setTokens = (access: string | null, refresh: string | null) => {
  accessToken = access;
  refreshToken = refresh;
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export const setOnUnauthorized = (handler: () => void) => {
  onUnauthorized = handler;
};

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      setTokens(null, null);
      return null;
    }

    const json = await res.json();
    if (json.success) {
      setTokens(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken;
    }
    return null;
  } catch {
    setTokens(null, null);
    return null;
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; count?: number }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      onUnauthorized?.();
      return { success: false, error: 'Session expired. Please login again.' };
    }
  }

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      return { success: false, error: json.error || `Request failed with status ${res.status}` };
    }
    return json;
  } catch {
    if (!res.ok) {
      return { success: false, error: `Request failed with status ${res.status}` };
    }
    return { success: true, data: text as any };
  }
}
