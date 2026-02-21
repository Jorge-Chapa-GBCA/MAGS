import type {
  UploadResponse,
  CreditInfo,
  AnalysisResult,
  SetupStatus,
  ReferenceUploadResult,
} from "../types";

const BASE = "/api";
const API_KEY_STORAGE_KEY = "mags_api_key";

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Core request helper — injects X-Api-Key on every call
// ---------------------------------------------------------------------------

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const apiKey = getStoredApiKey();
  const headers = new Headers(options?.headers);
  if (apiKey) {
    headers.set("X-Api-Key", apiKey);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Setup endpoints
// ---------------------------------------------------------------------------

export async function getSetupStatus(): Promise<SetupStatus> {
  return request<SetupStatus>(`${BASE}/setup/status`);
}

export async function uploadReference(file: File): Promise<ReferenceUploadResult> {
  const form = new FormData();
  form.append("file", file);
  return request<ReferenceUploadResult>(`${BASE}/setup/upload-reference`, {
    method: "POST",
    body: form,
  });
}

export async function validateApiKey(key: string): Promise<{ valid: boolean }> {
  // Send the key being tested via header (not the stored one)
  const res = await fetch(`${BASE}/setup/validate-key`, {
    method: "POST",
    headers: { "X-Api-Key": key },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Validation failed: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Existing endpoints
// ---------------------------------------------------------------------------

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  return request<UploadResponse>(`${BASE}/upload`, {
    method: "POST",
    body: form,
  });
}

export async function identifyCredit(sessionId: string): Promise<CreditInfo> {
  return request<CreditInfo>(`${BASE}/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export async function analyseSubmission(
  sessionId: string,
  creditInfo: CreditInfo,
): Promise<AnalysisResult> {
  return request<AnalysisResult>(`${BASE}/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, credit_info: creditInfo }),
  });
}
