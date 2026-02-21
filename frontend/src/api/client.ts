import type { UploadResponse, CreditInfo, AnalysisResult } from "../types";

const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

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

export async function analyseSubmission(sessionId: string, creditInfo: CreditInfo): Promise<AnalysisResult> {
  return request<AnalysisResult>(`${BASE}/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, credit_info: creditInfo }),
  });
}
