
import { ModelType } from '../types/models';

export const models: ModelType[] = [
  {
    id: "gemini-pro-2.5",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Capable of advanced reasoning and content generation",
    maxTokens: 32768,
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "DeepSeek",
    description: "Specialized in code generation and technical contexts",
    maxTokens: 16384,
  },
  {
    id: "llama3-70b",
    name: "Llama 3 70B",
    provider: "Meta",
    description: "Meta's flagship model with strong general capabilities",
    maxTokens: 8192,
  },
  {
    id: "qwen-72b",
    name: "Qwen 72B",
    provider: "Alibaba",
    description: "Versatile model with robust reasoning abilities",
    maxTokens: 8192,
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Top-tier model with exceptional reasoning and instruction following",
    maxTokens: 200000,
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    provider: "Mistral AI",
    description: "Mixture of experts model with efficient performance",
    maxTokens: 32768,
  }
];
