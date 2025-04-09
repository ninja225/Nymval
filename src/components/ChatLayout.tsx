
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { models } from '@/data/models';
import { ChatSession, ChatMessage } from '@/types/models';
import { sendMessage as sendChatMessage } from '../services/chatService';
import { ChatSidebar } from './ui/chat/ChatSidebar';
import { ModelSelector } from './ui/chat/ModelSelector';
import { SecondaryModelSelector } from './ui/chat/SecondaryModelSelector';
import { ChatMessage as ChatMessageComponent } from './ui/chat/ChatMessage';
import { ChatInput } from './ui/chat/ChatInput';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserProfile } from './ui/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserChats, createChatSession, deleteChat } from '@/services/chatService';
import { useNavigate } from 'react-router-dom';
import { toast } from './ui/use-toast';
import { ModelType } from '../types/models';

export function ChatLayout() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [selectedModels, setSelectedModels] = useState<string[]>([models[0].id]);
  const [splitView, setSplitView] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const activeChat = activeChatId ? chats.find(chat => chat.id === activeChatId) : undefined;
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch chats when user is authenticated
  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        try {
          const userChats = await fetchUserChats();
          setChats(userChats);
          if (userChats.length > 0 && !activeChatId) {
            setActiveChatId(userChats[0].id);
          }
        } catch (error) {
          console.error('Error loading chats:', error);
          toast({
            title: "Error",
            description: "Failed to load chat history.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadChats();
  }, [user, activeChatId]);
  
  const handleNewChat = async () => {
    setLoading(true);
    
    try {
      const newChat = await createChatSession("New Conversation", selectedModels[0]);
      
      if (newChat) {
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
      } else {
        toast({
          title: "Error",
          description: "Failed to create new chat.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectModel = (modelId: string) => {
    if (splitView) {
      const updatedModels = [...selectedModels];
      updatedModels[0] = modelId;
      setSelectedModels(updatedModels);
    } else {
      setSelectedModels([modelId]);
    }
  };

  const handleSelectSecondaryModel = (modelId: string) => {
    const updatedModels = [...selectedModels];
    updatedModels[1] = modelId;
    setSelectedModels(updatedModels);
  };
  
  const handleToggleSplitView = () => {
    setSplitView(!splitView);
    
    if (!splitView && selectedModels.length === 1) {
      const otherModelId = models.find(model => model.id !== selectedModels[0])?.id || models[1]?.id;
      setSelectedModels([selectedModels[0], otherModelId]);
    }
  };
  
  const handleSendMessage = async (content: string) => {
    if (!activeChatId) return;
    setLoading(true);

    try {
      const result = await sendChatMessage(activeChatId, content, selectedModels);
      
      if (result) {
        const { userMessage, assistantResponses } = result;
        
        // Update chat in state
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, userMessage, ...assistantResponses],
                  lastMessageDate: Date.now()
                }
              : chat
          )
        );
      } else {
        throw new Error('Failed to send message');
      }

  } catch (error) {
    console.error('Error sending message:', error);
    toast({
      title: "Error",
      description: "An error occurred while sending your message.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  // Handle chat deletion
  const handleDeleteChat = async (chatId: string) => {
    try {
      const success = await deleteChat(chatId);
      
      if (success) {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        if (activeChatId === chatId) {
          // Set next active chat
          const nextChat = chats.find(chat => chat.id !== chatId);
          setActiveChatId(nextChat?.id);
        }
        
        toast({
          title: "Success",
          description: "Chat deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete chat.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar 
        chats={chats}
        activeChat={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border p-2 flex items-center justify-between bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1">
            <ModelSelector 
              models={models} 
              selectedModels={selectedModels}
              onSelectModel={handleSelectModel}
              splitView={splitView}
              onToggleSplitView={handleToggleSplitView}
            />
            
            {splitView && selectedModels.length > 1 && (
              <SecondaryModelSelector
                models={models}
                selectedModel={selectedModels[1]}
                onSelectModel={handleSelectSecondaryModel}
                excludeModelId={selectedModels[0]}
              />
            )}
          </div>
        </div>
        
        {activeChat ? (
          <>
            <div className={cn(
              "flex-1 overflow-auto scrollbar-thin",
              splitView ? "grid grid-cols-2 divide-x divide-border" : ""
            )}>
              <div className="min-h-full">
                {activeChat.messages.map((message, index) => (
                  (!splitView || message.role === 'user' || !message.model || message.model === selectedModels[0]) && (
                    <ChatMessageComponent 
                      key={message.id} 
                      message={message} 
                      isLastMessage={index === activeChat.messages.length - 1}
                    />
                  )
                ))}
                
                {loading && !splitView && (
                  <div className="py-4 px-4 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 h-6"></div>
                  </div>
                )}
              </div>
              
              {splitView && (
                <div className="min-h-full">
                  {activeChat.messages.map((message) => (
                    (message.role === 'user' || (message.model && message.model === selectedModels[1])) && (
                      <ChatMessageComponent 
                        key={`${message.id}-secondary`} 
                        message={message} 
                      />
                    )
                  ))}
                  
                  {loading && splitView && (
                    <div className="py-4 px-4 flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 h-6"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <ChatInput onSendMessage={handleSendMessage} isLoading={loading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-bold mb-2 glow-text">Start a New Conversation</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Select a chat from the sidebar or create a new one to begin
            </p>
            <Button onClick={handleNewChat} className="glow-border">
              New Chat
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
