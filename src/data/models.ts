import { ModelType } from '../types/models';

export const models: ModelType[] = [
  {
    id: "gemini-pro-25",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    modelId: "google/gemini-pro",
    maxTokens: 32768,
    description: "Most capable Gemini model for highly complex tasks"
  },
  {
    id: "llama4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    modelId: "meta-llama/llama-4-maverick:free",
    maxTokens: 32768,
    description: "Advanced Llama model for complex reasoning"
  },
  {
    id: "llama4-scout",
    name: "Llama 4 Scout",
    provider: "Meta",
    modelId: "meta-llama/llama-4-scout:free",
    maxTokens: 32768,
    description: "Efficient Llama model for general tasks"
  },
  {
    id: "qwen25-vl",
    name: "Qwen2.5 VL 3B",
    provider: "Alibaba",
    modelId: "qwen/qwen2.5-vl-3b-instruct:free",
    maxTokens: 16384,
    description: "Multimodal model with vision capabilities"
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    modelId: "deepseek/deepseek-chat-v3-0324:free",
    maxTokens: 32768,
    description: "Advanced model for diverse tasks"
  },
  // Add More Models Here
  // {
  //   id: "claude-37-sonnet",
  //   name: "Claude 3.7 Sonnet",
  //   provider: "Anthropic",
  //   modelId: "anthropic/claude-3.7-sonnet",
  //   maxTokens: 200000,
  //   description: "Powerful Claude model for complex tasks"
  // },
  // {
  //   id: "claude-35-haiku",
  //   name: "Claude 3.5 Haiku",
  //   provider: "Anthropic",
  //   modelId: "anthropic/claude-3.5-haiku",
  //   maxTokens: 200000,
  //   description: "Fast and efficient Claude model"
  // }
];