-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for storing chat sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for storing chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for storing models used in chat sessions
CREATE TABLE public.session_models (
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  model_id TEXT NOT NULL,
  PRIMARY KEY (session_id, model_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for chat sessions
CREATE POLICY "Users can view their own chat sessions" 
  ON public.chat_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" 
  ON public.chat_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
  ON public.chat_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
  ON public.chat_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for chat messages
CREATE POLICY "Users can view messages of their own chat sessions" 
  ON public.chat_messages FOR SELECT 
  USING ((SELECT user_id FROM public.chat_sessions WHERE id = chat_messages.session_id) = auth.uid());

CREATE POLICY "Users can insert messages into their own chat sessions" 
  ON public.chat_messages FOR INSERT 
  WITH CHECK ((SELECT user_id FROM public.chat_sessions WHERE id = chat_messages.session_id) = auth.uid());

CREATE POLICY "Users can update messages in their own chat sessions" 
  ON public.chat_messages FOR UPDATE 
  USING ((SELECT user_id FROM public.chat_sessions WHERE id = chat_messages.session_id) = auth.uid());

CREATE POLICY "Users can delete messages from their own chat sessions" 
  ON public.chat_messages FOR DELETE 
  USING ((SELECT user_id FROM public.chat_sessions WHERE id = chat_messages.session_id) = auth.uid());

-- Create RLS policies for session models
CREATE POLICY "Users can view models of their own chat sessions" 
  ON public.session_models FOR SELECT 
  USING ((SELECT user_id FROM public.chat_sessions WHERE id = session_models.session_id) = auth.uid());

CREATE POLICY "Users can insert models into their own chat sessions" 
  ON public.session_models FOR INSERT 
  WITH CHECK ((SELECT user_id FROM public.chat_sessions WHERE id = session_models.session_id) = auth.uid());

CREATE POLICY "Users can delete models from their own chat sessions" 
  ON public.session_models FOR DELETE 
  USING ((SELECT user_id FROM public.chat_sessions WHERE id = session_models.session_id) = auth.uid());

-- Create a function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create profiles when users sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
