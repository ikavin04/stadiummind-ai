const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response;
}

// ─────────────────────────────────────────
// Auth
// ─────────────────────────────────────────
export async function demoLogin(role = 'manager') {
  const res = await fetchWithAuth(`/api/auth/demo-login?role=${role}`, { method: 'POST' });
  return res.json();
}

export async function syncUser() {
  const res = await fetchWithAuth('/api/auth/sync', { method: 'POST' });
  return res.json();
}

// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────
export async function getDashboardSummary() {
  const res = await fetchWithAuth('/api/dashboard/summary');
  return res.json();
}

// ─────────────────────────────────────────
// Crowd
// ─────────────────────────────────────────
export async function getCrowdZones() {
  const res = await fetchWithAuth('/api/crowd/zones');
  return res.json();
}

export async function getCrowdPredictions(zoneId?: string) {
  const url = zoneId ? `/api/crowd/predictions?zone_id=${zoneId}` : '/api/crowd/predictions';
  const res = await fetchWithAuth(url);
  return res.json();
}

export async function getZoneHistory(zoneId: string) {
  const res = await fetchWithAuth(`/api/crowd/history?zone_id=${zoneId}`);
  return res.json();
}

export async function manualSimulateTick() {
  const res = await fetchWithAuth('/api/crowd/simulate-tick', { method: 'POST' });
  return res.json();
}

// ─────────────────────────────────────────
// Chat
// ─────────────────────────────────────────
export async function sendChatMessage(payload: {
  conversation_id?: string;
  message: string;
  language: string;
}) {
  const res = await fetchWithAuth('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getChatHistory(conversationId: string) {
  const res = await fetchWithAuth(`/api/chat/history?conversation_id=${conversationId}`);
  return res.json();
}

// ─────────────────────────────────────────
// i18n
// ─────────────────────────────────────────
export async function translateText(text: string, targetLanguage: string) {
  const res = await fetchWithAuth('/api/i18n/translate', {
    method: 'POST',
    body: JSON.stringify({ text, target_language: targetLanguage }),
  });
  return res.json();
}

export { API_BASE };
