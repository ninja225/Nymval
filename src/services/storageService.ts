
import { supabase } from "@/integrations/supabase/client";

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

export async function deleteAvatar(path: string): Promise<void> {
  try {
    // Extract the path from the URL
    const pathParts = path.split('avatars/');
    if (pathParts.length < 2) throw new Error('Invalid avatar URL');
    
    const filePath = pathParts[1];
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
}
