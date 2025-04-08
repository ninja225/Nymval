
import { User, Bot } from 'lucide-react';
import { ChatMessage as MessageType } from '@/types/models';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { models } from '@/data/models';

interface ChatMessageProps {
  message: MessageType;
  isLastMessage?: boolean;
}

export function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Find the model name if available
  const modelInfo = message.model 
    ? models.find(model => model.id === message.model) 
    : undefined;
    
  return (
    <div 
      className={cn(
        "py-6 px-4 flex gap-4 message-appear",
        isUser ? "bg-transparent" : "bg-accent/40",
        isLastMessage && !isUser && "animate-pulse-glow"
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">
            {isUser ? "You" : modelInfo?.name || "AI Assistant"}
          </h3>
          
          {modelInfo && !isUser && (
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              {modelInfo.provider}
            </span>
          )}
        </div>
        
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
