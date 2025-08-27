import type { Provider } from "./common";

export const isProvider = (v: string): v is Provider =>
  v === "openai" || v === "anthropic" || v === "gemini" || v === "ollama";
