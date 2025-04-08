
import { useState, KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  
  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="w-full p-4 border-t border-border input-gradient">
      <div className="flex gap-2 items-end max-w-4xl mx-auto relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the AI..."
          className={cn(
            "resize-none min-h-[60px] pr-12 bg-secondary/80 border-primary/20",
            isLoading && "opacity-50"
          )}
          disabled={isLoading}
        />
        <Button
          size="icon"
          className={cn(
            "absolute bottom-2 right-2 rounded-full h-8 w-8",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
