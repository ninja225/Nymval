
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Trash2, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { uploadAvatar } from "@/services/storageService";

export function ProfileMenu() {
  const { user, signOut, updateProfile } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [user]);
  
  if (!user) return null;
  
  const userInitials = user.email ? 
    user.email.substring(0, 2).toUpperCase() : 
    user.user_metadata?.full_name ? 
      user.user_metadata.full_name.substring(0, 2).toUpperCase() : 
      "U";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      
      setIsLoading(true);
      
      // Upload avatar using storage service
      const publicUrl = await uploadAvatar(user.id, file);
      
      // Update avatar URL in both state and profile
      setAvatarUrl(publicUrl);
      await updateProfile({ avatar_url: publicUrl });
      
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please ensure the file is an image and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl
      });
      setIsProfileDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChats = async () => {
    try {
      setIsLoading(true);
      
      // Delete all user's chat sessions
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Chats cleared",
        description: "All your chat history has been cleared.",
      });

      // Refresh the page after successful deletion
      window.location.reload();
    } catch (error) {
      console.error('Error clearing chats:', error);
      toast({
        title: "Error",
        description: "Failed to clear chats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
            <Avatar className="h-12 w-12  border-2 border-white hover:border-pink-400 transition-colors duration-200 ease-in-out">
              <AvatarImage 
                src={user.user_metadata?.avatar_url} 
                alt={user.user_metadata?.full_name || user.email || "User"} 
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem disabled className="opacity-70">
            {user.user_metadata?.full_name || user.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClearChats}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Clear Chat History</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4 mb-2">
              <Avatar className="h-16 w-16 border-2 border-pink-400 animate-spin-prof">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer text-sm px-2 py-1 border rounded-md hover:bg-accent">
                  Change Avatar
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsProfileDialogOpen(false)} 
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProfileUpdate}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
