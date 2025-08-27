import type { ChatMessage, CommonParams } from "../common";

export interface OllamaOptions {
  repeat_penalty?: number;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  num_ctx?: number;
  num_gpu?: number;
  [k: string]: unknown;
}

export interface OllamaVendorOptions {
  options?: OllamaOptions;
  [k: string]: unknown;
}

export interface OllamaRequest extends CommonParams {
  provider: "ollama";
  model: string;
  messages: ChatMessage[];
  vendor_options?: OllamaVendorOptions;
}
