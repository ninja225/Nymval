
import { useState } from 'react';
import { PlusCircle, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatSession } from '@/types/models';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSidebarProps {
  chats: ChatSession[];
  activeChat?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat?: (chatId: string) => void;
}

export function ChatSidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleDeleteChat = (chatId: string) => {
    setChatToDelete(null);
    onDeleteChat?.(chatId);
  };

  return (
    <aside className="w-[280px] border-r border-border flex flex-col h-screen bg-secondary">
      <div className="p-4">
        <Button 
          onClick={onNewChat} 
          variant="outline" 
          className="w-full justify-start gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20 glow-border animate-pulse-glow"
        >
          <PlusCircle size={16} />
          <span>New Chat</span>
        </Button>
        
        <div className="mt-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-8 bg-background/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto scrollbar-thin py-2">
        {filteredChats.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground text-center">
            No chats found
          </div>
        )}
        
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            className={cn(
              "relative group w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors",
              activeChat === chat.id && "bg-accent"
            )}
          >
            <button 
              onClick={() => onSelectChat(chat.id)}
              className="w-full text-left"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate text-sm flex-1">{chat.title}</h3>
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {formatDate(chat.lastMessageDate)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {chat.messages[chat.messages.length - 1]?.content.slice(0, 50)}...
              </p>
            </button>
            
            {onDeleteChat && (
              <AlertDialog open={chatToDelete === chat.id} onOpenChange={(open) => !open && setChatToDelete(null)}>
                <AlertDialogTrigger asChild>
                  <button 
                    className="absolute right-2 top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat.id);
                    }}
                  >
                    <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chat? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteChat(chat.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
