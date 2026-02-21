export interface UploadResponse {
  session_id: string;
  filename: string;
  file_type: string;
  page_count: number;
  char_count: number;
}

export interface CreditInfo {
  credit_id: string;
  credit_name: string;
  rating_tool: string;
  confidence: number;
  summary: string;
}

export interface Finding {
  id: string;
  category: "structural" | "content" | "terminology";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  location: string;
  suggestion: string;
  reference: string;
}

export interface AnalysisResult {
  overall_score: number;
  summary: string;
  findings: Finding[];
  strengths: string[];
}

export interface SetupStatus {
  api_key_set: boolean;
  reference_docs_loaded: Record<string, number>;
  ready: boolean;
}

export interface ReferenceUploadResult {
  key: string;
  filename: string;
  char_count: number;
}
