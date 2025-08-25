import type { ChatMessage, CommonParams } from "../common";

export interface AnthropicVendorOptions {
  stop_sequences?: string[];
  metadata?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface AnthropicRequest extends CommonParams {
  provider: "anthropic";
  model: string;
  messages: ChatMessage[];
  vendor_options?: AnthropicVendorOptions;
}
