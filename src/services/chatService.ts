
import { supabase } from "@/integrations/supabase/client";
import { ChatSession, ChatMessage } from "@/types/models";
import { v4 as uuidv4 } from 'uuid';
import { Database } from "@/integrations/supabase/types";

// Type definitions to work with Supabase
type Tables = Database['public']['Tables'];
type ChatSessionRow = Tables['chat_sessions']['Row'];
type ChatMessageRow = Tables['chat_messages']['Row'];
type SessionModelRow = Tables['session_models']['Row'];

export async function fetchUserChats(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      title,
      last_message_date,
      created_at
    `)
    .order('last_message_date', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    return [];
  }

  // Fetch messages and models for each session
  const chatSessions: ChatSession[] = [];
  
  for (const session of data) {
    // Get messages for this session
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, role, content, model, created_at')
      .eq('session_id', session.id);
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      continue;
    }

    // Get models for this session
    const { data: modelsData, error: modelsError } = await supabase
      .from('session_models')
      .select('model_id')
      .eq('session_id', session.id);
    
    if (modelsError) {
      console.error('Error fetching models:', modelsError);
      continue;
    }

    chatSessions.push({
      id: session.id,
      title: session.title,
      messages: messagesData.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        model: msg.model || undefined,
        createdAt: new Date(msg.created_at).getTime()
      })),
      lastMessageDate: new Date(session.last_message_date).getTime(),
      models: modelsData.map(model => model.model_id)
    });
  }

  return chatSessions;
}

export async function createChatSession(title: string, modelId: string): Promise<ChatSession | null> {
  const sessionId = uuidv4();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    console.error('User not authenticated');
    return null;
  }
  
  // Create session
  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .insert({
      id: sessionId,
      user_id: userId,
      title: title || 'New Conversation',
      last_message_date: new Date().toISOString()
    } as Tables['chat_sessions']['Insert']);
  
  if (sessionError) {
    console.error('Error creating chat session:', sessionError);
    return null;
  }

  // Add model to session
  const { error: modelError } = await supabase
    .from('session_models')
    .insert({
      session_id: sessionId,
      model_id: modelId
    } as Tables['session_models']['Insert']);
  
  if (modelError) {
    console.error('Error adding model to session:', modelError);
    // Continue anyway since the session was created
  }

  return {
    id: sessionId,
    title: title || 'New Conversation',
    messages: [],
    lastMessageDate: Date.now(),
    models: [modelId]
  };
}

export async function sendMessage(
  sessionId: string, 
  content: string, 
  selectedModels: string[]
): Promise<{userMessage: ChatMessage, assistantResponses: ChatMessage[]} | null> {
  try {
    // Create user message
    const userMessageId = uuidv4();
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        id: userMessageId,
        session_id: sessionId,
        role: 'user',
        content
      } as Tables['chat_messages']['Insert']);
    
    if (userMessageError) throw userMessageError;

    // Update session title if this is the first message
    const { data: messageCount } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);
    
    if (messageCount && messageCount.length <= 1) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      
      await supabase
        .from('chat_sessions')
        .update({ title } as Partial<Tables['chat_sessions']['Update']>)
        .eq('id', sessionId);
    }

    // Update last_message_date
    await supabase
      .from('chat_sessions')
      .update({ last_message_date: new Date().toISOString() } as Partial<Tables['chat_sessions']['Update']>)
      .eq('id', sessionId);

    // In a real implementation, you would call an API to get AI responses
    // For now, we'll simulate AI responses
    const assistantResponses: ChatMessage[] = [];
    
    for (const modelId of selectedModels) {
      const responseMessageId = uuidv4();
      const simulatedResponse = `This is a simulated response from ${modelId}. In a real implementation, this would call an AI API with the selected model.`;
      
      const { error: assistantMessageError } = await supabase
        .from('chat_messages')
        .insert({
          id: responseMessageId,
          session_id: sessionId,
          role: 'assistant',
          content: simulatedResponse,
          model: modelId
        } as Tables['chat_messages']['Insert']);
      
      if (assistantMessageError) throw assistantMessageError;
      
      assistantResponses.push({
        id: responseMessageId,
        role: 'assistant',
        content: simulatedResponse,
        model: modelId,
        createdAt: Date.now()
      });
    }

    // Update last_message_date again
    await supabase
      .from('chat_sessions')
      .update({ last_message_date: new Date().toISOString() } as Partial<Tables['chat_sessions']['Update']>)
      .eq('id', sessionId);

    // Return the user message and AI responses
    return {
      userMessage: {
        id: userMessageId,
        role: 'user',
        content,
        createdAt: Date.now()
      },
      assistantResponses
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

export async function deleteChat(chatId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', chatId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting chat:', error);
    return false;
  }
}
