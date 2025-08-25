import type { ChatMessage, CommonParams } from "../common";

export interface GeminiGenerationConfig {
  candidate_count?: number;
  [k: string]: unknown;
}

export interface GeminiVendorOptions {
  generation_config?: GeminiGenerationConfig;
  tools?: unknown;
  safety_settings?: unknown;
  [k: string]: unknown;
}

export interface GeminiRequest extends CommonParams {
  provider: "gemini";
  model: string;
  messages: ChatMessage[];
  vendor_options?: GeminiVendorOptions;
}
