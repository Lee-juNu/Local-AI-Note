export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface Usage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
}

export interface ChatOutput {
  role: Role; // 서버 규약상 "assistant"
  content: string;
  finish_reason?: string | null;
}

export interface ChatResponse {
  provider: Provider;
  model: string;
  output: ChatOutput;
  usage: Usage;
  raw?: Record<string, unknown> | null; // 디버깅용
}

export interface ServerActionResult {
  ok: boolean;
  data?: ChatResponse;
  error?: string;
}

export interface CommonParams {
  temperature?: number; // 기본값은 클라이언트/서버에서 정함
  top_p?: number | null;
  max_tokens?: number | null;
}

// 현재 허브가 지원하는 프로바이더 키
export type Provider = "openai" | "anthropic" | "gemini" | "ollama";

export const DEFAULTS: Readonly<Required<Pick<CommonParams, "temperature">>> = {
  temperature: 0.7,
};
