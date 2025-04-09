import { ModelType, ChatMessage as ChatMessageType } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL;
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface ContentItem {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentItem[];
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  model: string;
  created: number;
}

// Maximum tokens per message to prevent context length errors
const MAX_TOKENS_PER_MESSAGE = 8000;

// Simple token estimation function (4 chars ≈ 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Function to truncate messages to fit within token limits
function truncateMessages(messages: { role: string; content: string | ContentItem[] }[], maxTokens: number) {
  let totalTokens = 0;
  const truncatedMessages = [];
  
  // Process messages from newest to oldest
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const content = typeof msg.content === 'string' ? msg.content : 
      msg.content.map(item => item.type === 'text' ? item.text : '').join(' ');
    
    const tokens = estimateTokens(content);
    
    if (totalTokens + tokens <= maxTokens) {
      truncatedMessages.unshift(msg);
      totalTokens += tokens;
    } else {
      // For the last message that would exceed the limit, truncate it
      const remainingTokens = maxTokens - totalTokens;
      if (remainingTokens > 0) {
        const truncatedContent = content.slice(0, remainingTokens * 4);
        truncatedMessages.unshift({
          ...msg,
          content: truncatedContent
        });
      }
      break;
    }
  }
  
  return truncatedMessages;
}

export async function sendMessage(model: ModelType, messages: { role: string; content: string | ContentItem[] }[]): Promise<ChatMessageType> {
  try {
    if (!messages.length) {
      throw new Error('No messages provided');
    }

    // Truncate messages to fit within token limit
    const truncatedMessages = truncateMessages(messages, MAX_TOKENS_PER_MESSAGE);
    
    // Validate messages format and content
    const validatedMessages = truncatedMessages.map(msg => {
      if (!msg.content) {
        throw new Error('Invalid message content');
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        throw new Error(`Invalid message role: ${msg.role}`);
      }

      // Handle both string content and ContentItem[] content
      if (typeof msg.content === 'string') {
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content.trim()
        };
      } else if (Array.isArray(msg.content)) {
        // Validate each content item
        msg.content.forEach(item => {
          if (!item.type || !['text', 'image_url'].includes(item.type)) {
            throw new Error('Invalid content item type');
          }
          if (item.type === 'text' && !item.text) {
            throw new Error('Text content item missing text');
          }
          if (item.type === 'image_url' && (!item.image_url || !item.image_url.url)) {
            throw new Error('Image content item missing URL');
          }
        });
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        };
      }
      throw new Error('Invalid message content format');
    });

    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Nymval-AI Chat'
      },
      body: JSON.stringify({
        model: model.modelId,
        messages: validatedMessages,
        max_tokens: Math.min(model.maxTokens || 2048, 32000), // Ensure we don't exceed model's max tokens
        temperature: 0.7,
        top_p: 0.95,
        stream: false
      })
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Response parsing error:', e);
      throw new Error('Failed to parse API response');
    }

    if (!response.ok) {
      console.error('API Error Response:', responseData);
      const errorMessage = responseData.error?.message || 
        responseData.error?.type ||
        responseData.error?.code ||
        response.statusText ||
        'Unknown API error';
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    // Enhanced response validation with better error handling
    if (!responseData || typeof responseData !== 'object') {
      console.error('Invalid response data:', responseData);
      throw new Error(`Invalid response data from ${model.name}. Please try again.`);
    }

    // Some models might return the response in a different format
    let messageContent = '';
    
    if (Array.isArray(responseData.choices) && responseData.choices.length > 0) {
      // Standard OpenAI-like format
      messageContent = responseData.choices[0]?.message?.content;
    } else if (responseData.content) {
      // Alternative format where content is directly in the response
      messageContent = responseData.content;
    } else if (responseData.response) {
      // Another possible format
      messageContent = responseData.response;
    }

    if (typeof messageContent !== 'string' || !messageContent.trim()) {
      console.error('Response format from model:', responseData);
      throw new Error(`Unexpected response format from ${model.name}. Please try a different model.`);
    }

    return {
      id: responseData.id || uuidv4(), // Use OpenRouter's message ID if available
      role: 'assistant',
      content: messageContent,
      model: model.id,
      createdAt: responseData.created ? responseData.created * 1000 : Date.now() // Convert Unix timestamp to milliseconds
    };
  } catch (error) {
    console.error(`Error with ${model.name}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to get response from ${model.name}`
    );
  }
}