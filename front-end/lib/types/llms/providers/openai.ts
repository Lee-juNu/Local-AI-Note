import type { ChatMessage, CommonParams } from "../common";

export interface OpenAIVendorOptions {
  frequency_penalty?: number;
  presence_penalty?: number;
  [k: string]: unknown;
}

export interface OpenAIRequest extends CommonParams {
  provider: "openai";
  model: string;
  messages: ChatMessage[];
  vendor_options?: OpenAIVendorOptions;
}
