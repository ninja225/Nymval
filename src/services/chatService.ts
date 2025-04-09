import { supabase } from "@/integrations/supabase/client";
import { ChatSession, ChatMessage } from "@/types/models";
import { v4 as uuidv4 } from 'uuid';
import { Database } from "@/integrations/supabase/types";
import { sendMessage as sendOpenRouterMessage } from './openRouterService';
import { models } from '@/data/models';

// Type definitions to work with Supabase
type Tables = Database['public']['Tables'];

export async function fetchUserChats(): Promise<ChatSession[]> {
  const { data: sessions, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      title,
      last_message_date,
      created_at,
      session_models(model_id)
    `)
    .order('last_message_date', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching chat sessions:', sessionsError);
    return [];
  }

  const chatSessions: ChatSession[] = [];
  for (const session of sessions) {
    // Fetch messages for each session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error(`Error fetching messages for session ${session.id}:`, messagesError);
      continue;
    }

    chatSessions.push({
      id: session.id,
      title: session.title,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        model: msg.model,
        createdAt: new Date(msg.created_at).getTime()
      })),
      lastMessageDate: new Date(session.last_message_date).getTime(),
      models: session.session_models?.map((model: { model_id: string }) => model.model_id) || []
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

  // Create new chat session
  const sessionData = {
    id: sessionId,
    user_id: userId,
    title: title || 'New Conversation',
    last_message_date: new Date().toISOString()
  };

  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .insert(sessionData as Tables['chat_sessions']['Insert']);

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
): Promise<{ userMessage: ChatMessage, assistantResponses: ChatMessage[] } | null> {
  try {
    // Validate inputs with detailed error messages
    if (!sessionId) {
      console.error('Session ID is required');
      return null;
    }
    if (!content?.trim()) {
      console.error('Message content cannot be empty');
      return null;
    }
    if (!selectedModels?.length) {
      console.error('At least one model must be selected');
      return null;
    }

    // Verify session exists
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('Session not found:', sessionError);
      return null;
    }

    // Create and store user message in chat_messages table
    const userMessageId = uuidv4();
    const now = new Date().toISOString();
    const userMessageContent = content.trim();

    const { data: userMessageData, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        id: userMessageId,
        session_id: sessionId,
        role: 'user',
        content: userMessageContent,
        created_at: now,
        model: null // Explicitly set model as null for user messages
      } as Tables['chat_messages']['Insert'])
      .select()
      .single();

    if (messageError || !userMessageData) {
      console.error('Error saving user message:', messageError);
      throw new Error(`Failed to save user message: ${messageError?.message || 'Unknown error'}`);
    }

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: userMessageContent,
      createdAt: new Date(now).getTime()
    };

    // Update session title if this is the first message
    const { count: messageCount } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (messageCount === 1) {
      const title = userMessageContent.length > 30 ? userMessageContent.substring(0, 30) + '...' : userMessageContent;
      await supabase
        .from('chat_sessions')
        .update({ title } as Partial<Tables['chat_sessions']['Update']>)
        .eq('id', sessionId);
    }

    // Helper function to update last_message_date
    const updateLastMessageDate = async () => {
      await supabase
        .from('chat_sessions')
        .update({ last_message_date: new Date().toISOString() } as Partial<Tables['chat_sessions']['Update']>)
        .eq('id', sessionId);
    };

    await updateLastMessageDate();

    // Get AI responses from OpenRouter
    const assistantResponses: ChatMessage[] = [];
    for (const modelId of selectedModels) {
      const model = models.find(m => m.id === modelId);
      if (!model) {
        console.error(`Model ${modelId} not found`);
        continue;
      }

      try {
        // Get messages for context
        const { data: sessionMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        const messageHistory = sessionMessages?.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })) || [];

        // Add current message
        messageHistory.push({
          role: 'user',
          content: userMessageContent
        });

        // Get AI response
        const response = await sendOpenRouterMessage(model, messageHistory);
        if (!response || typeof response.content !== 'string') {
          console.error('Invalid or empty response from model');
          throw new Error('No valid response received from the model');
        }

        // Create a new message ID for the assistant's response
        const assistantMessageId = uuidv4();
        const assistantTimestamp = new Date().toISOString();
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: response.content.trim(),
          model: modelId,
          createdAt: new Date(assistantTimestamp).getTime()
        };

        // Store assistant message in chat_messages table
        const { data: assistantMessageData, error: assistantMessageError } = await supabase
          .from('chat_messages')
          .insert({
            id: assistantMessageId,
            session_id: sessionId,
            role: 'assistant',
            content: response.content.trim(),
            model: modelId,
            created_at: assistantTimestamp
          } as Tables['chat_messages']['Insert'])
          .select()
          .single();

        if (assistantMessageError || !assistantMessageData) {
          console.error('Error saving assistant message:', assistantMessageError);
          throw new Error(`Failed to save assistant message: ${assistantMessageError?.message || 'Unknown error'}`);
        }

        // Verify the message was actually stored
        const { data: verifyMessage, error: verifyError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('id', assistantMessageId)
          .single();

        if (verifyError || !verifyMessage) {
          console.error('Failed to verify message storage:', verifyError);
          throw new Error('Message verification failed after storage');
        }

        assistantResponses.push(assistantMessage);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Error with model ${model.name}:`, errorMessage);

        // If this is the last model and we have no responses yet, throw the error
        if (modelId === selectedModels[selectedModels.length - 1] && assistantResponses.length === 0) {
          throw new Error(`Failed to get response: ${errorMessage}`);
        }
        continue;
      }
    }

    await updateLastMessageDate(); // Update last_message_date again
    return { userMessage, assistantResponses };
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